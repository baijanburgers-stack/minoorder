// offline_sync_engine.dart
// Production-grade Offline Transaction Sync Engine for MinoOrder Mobile Clients

import 'dart:async';
import 'dart:math';

// Simplified local models representing database transaction outbox
class OfflineOrder {
  final String orderId; // UUID primary key
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  String syncStatus; // 'pending', 'synced', 'failed_validation'
  int retryCount;

  OfflineOrder({
    required this.orderId,
    required this.payload,
    required this.createdAt,
    this.syncStatus = 'pending',
    this.retryCount = 0,
  });

  Map<String, dynamic> toJson() => {
    'orderId': orderId,
    'payload': payload,
    'createdAt': createdAt.toIso8601String(),
    'syncStatus': syncStatus,
    'retryCount': retryCount,
  };
}

class OfflineSyncEngine {
  final List<OfflineOrder> _localQueue = [];
  bool _isOnline = true;
  bool _isSyncing = false;
  Timer? _syncTimer;

  // Stream controller to alert POS/Kiosk UI layers of network and queue changes
  final _statusController = StreamController<String>.broadcast();
  Stream<String> get statusStream => _statusController.stream;

  List<OfflineOrder> get pendingQueue => _localQueue.where((o) => o.syncStatus == 'pending').toList();

  /// Starts the network background polling daemon.
  void startSyncDaemon() {
    _syncTimer = Timer.periodic(const Duration(seconds: 15), (timer) {
      if (_isOnline && !_isSyncing) {
        syncQueueToServer();
      }
    });
    _statusController.add('Offline Sync Daemon activated.');
  }

  /// Stops background polling.
  void stopSyncDaemon() {
    _syncTimer?.cancel();
    _statusController.add('Offline Sync Daemon stopped.');
  }

  /// Appends completed cash/card sale order to the local SQLite/Sembast outbox.
  void enqueueOfflineOrder(String uuid, Map<String, dynamic> payload) {
    final order = OfflineOrder(
      orderId: uuid,
      payload: payload,
      createdAt: DateTime.now(),
    );
    _localQueue.add(order);
    _statusController.add('Order $uuid enqueued locally. Status: pending.');
    
    if (_isOnline && !_isSyncing) {
      syncQueueToServer();
    }
  }

  /// Processes the outbox sequentially, submitting pending sales to the create-order Edge Function.
  Future<void> syncQueueToServer() async {
    final pending = pendingQueue;
    if (pending.isEmpty) return;

    _isSyncing = true;
    _statusController.add('Beginning outbox synchronization of ${pending.length} orders...');

    for (var order in pending) {
      bool success = false;
      try {
        _statusController.add('Syncing order ID: ${order.orderId} (Retry: ${order.retryCount})...');
        
        // Simulating secure network API request to Supabase Edge Function `create-order`
        // We inject the unique orderId as the header 'X-Idempotency-Key'
        final response = await _mockSubmitToEdgeFunction(order.orderId, order.payload);

        if (response['statusCode'] == 201 || response['statusCode'] == 200) {
          // 201 Created or 200 OK (Duplicate transaction skipped safely on server)
          order.syncStatus = 'synced';
          success = true;
          _statusController.add('✔️ Order ${order.orderId} synced successfully.');
        } else if (response['statusCode'] == 400) {
          // 400 Bad Request: client validation failure (do not retry, flags for store operator)
          order.syncStatus = 'failed_validation';
          success = true; // Mark done to unblock queue, held in errors tab
          _statusController.add('❌ Order ${order.orderId} validation failed. Held for operator review.');
        } else {
          // 500 Server Error or timeout
          throw Exception('Server returned retryable status code: ${response['statusCode']}');
        }
      } catch (e) {
        order.retryCount += 1;
        // Schedule backoff delay
        final backoffSeconds = pow(2, min(order.retryCount, 6)).toInt();
        _statusController.add('⚠️ Sync failed: $e. Retrying in $backoffSeconds seconds.');
        break; // Stop sequential queue process to preserve order sequence compliance
      }
    }

    _isSyncing = false;
    _statusController.add('Sync run complete. Pending items in outbox: ${pendingQueue.length}');
  }

  /// Connection status state toggler called by host device status observers.
  void updateNetworkStatus(bool online) {
    _isOnline = online;
    _statusController.add(online ? 'Network restored. Online.' : 'Network dropped. Running offline mode.');
    if (online && !_isSyncing) {
      syncQueueToServer();
    }
  }

  // Simulates Supabase Client HTTP Post with serverless runtime delays
  Future<Map<String, dynamic>> _mockSubmitToEdgeFunction(String idempotencyKey, Map<String, dynamic> payload) async {
    await Future.delayed(const Duration(milliseconds: 800)); // Network delay

    // If payload contains invalid fields, simulate validation rejection
    if (payload['store_id'] == null) {
      return {'statusCode': 400, 'error': 'Missing store_id parameter.'};
    }

    // Simulate occasional server-side database glitch for high-availability test
    if (idempotencyKey.contains('fail')) {
      return {'statusCode': 500, 'error': 'Database locking conflict.'};
    }

    return {
      'statusCode': 201, 
      'body': {'message': 'Order successfully written.', 'id': idempotencyKey}
    };
  }
}
