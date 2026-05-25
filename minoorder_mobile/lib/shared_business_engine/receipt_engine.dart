// receipt_engine.dart
// Production-grade Multi-Printer Receipt & ESC/POS Formatting Engine for MinoOrder

class ReceiptLineItem {
  final String name;
  final int quantity;
  final double grossPrice;
  final double netPrice;
  final double vatRate;
  final String vatCodeLetter; // 'A' = 21%, 'B' = 12%, 'C' = 6%, 'D' = 0%
  final List<String> modifiers;

  const ReceiptLineItem({
    required this.name,
    required this.quantity,
    required this.grossPrice,
    required this.netPrice,
    required this.vatRate,
    required this.vatCodeLetter,
    this.modifiers = const [],
  });
}

class ReceiptTaxRow {
  final String codeLetter;
  final double rate;
  final double gross;
  final double net;
  final double vat;

  const ReceiptTaxRow({
    required this.codeLetter,
    required this.rate,
    required this.gross,
    required this.net,
    required this.vat,
  });
}

class FiscalMetadata {
  final String receiptNumber;
  final String fdmSerialNumber;
  final int signatureCounter;
  final String signatureHash;
  final DateTime timestamp;

  const FiscalMetadata({
    required this.receiptNumber,
    required this.fdmSerialNumber,
    required this.signatureCounter,
    required this.signatureHash,
    required this.timestamp,
  });
}

class ReceiptDocument {
  final String storeName;
  final String companyName;
  final String vatNumber;
  final String address;
  final String phone;
  final String cashierName;
  final String orderNumber;
  final List<ReceiptLineItem> items;
  final double totalGross;
  final double totalNet;
  final double totalVat;
  final List<ReceiptTaxRow> taxBreakdown;
  final FiscalMetadata? fiscalInfo;
  final String paymentMethodText;

  const ReceiptDocument({
    required this.storeName,
    required this.companyName,
    required this.vatNumber,
    required this.address,
    required this.phone,
    required this.cashierName,
    required this.orderNumber,
    required this.items,
    required this.totalGross,
    required this.totalNet,
    required this.totalVat,
    required this.taxBreakdown,
    this.fiscalInfo,
    required this.paymentMethodText,
  });
}

class ReceiptEngine {
  static const int _lineWidth80mm = 42; // Standard 80mm printer character limit per line

  /// Generates the raw string/ESC-POS representation of the receipt document.
  static String generateTextReceipt(ReceiptDocument doc) {
    final buffer = StringBuffer();

    // 1. Double-width high brand header centering
    buffer.writeln(_centerText('** MINOORDER **', _lineWidth80mm));
    buffer.writeln(_centerText(doc.storeName.toUpperCase(), _lineWidth80mm));
    buffer.writeln(_centerText(doc.companyName, _lineWidth80mm));
    buffer.writeln(_centerText('VAT: ${doc.vatNumber}', _lineWidth80mm));
    buffer.writeln(_centerText(doc.address, _lineWidth80mm));
    buffer.writeln(_centerText('TEL: ${doc.phone}', _lineWidth80mm));
    buffer.writeln(_divider('-'));

    // 2. Receipt metadata
    buffer.writeln(_alignLeftRight('DATE: ${DateTime.now().toLocal().toString().substring(0, 19)}', 'CASHIER: ${doc.cashierName}'));
    buffer.writeln(_alignLeftRight('ORDER: ${doc.orderNumber}', 'MODE: Dine-In'));
    buffer.writeln(_divider('='));

    // 3. Columns header
    buffer.writeln(_formatThreeColumns('ITEM DESCRIPTION', 'QTY', 'PRICE (VAT)', _lineWidth80mm));
    buffer.writeln(_divider('-'));

    // 4. Print items & modifiers
    for (var item in doc.items) {
      final priceStr = '€ ${(item.grossPrice * item.quantity).toStringAsFixed(2)} (${item.vatCodeLetter})';
      buffer.writeln(_formatThreeColumns(item.name.toUpperCase(), '${item.quantity}x', priceStr, _lineWidth80mm));
      for (var mod in item.modifiers) {
        buffer.writeln('  + ${mod.toLowerCase()}');
      }
    }
    buffer.writeln(_divider('-'));

    // 5. Grand Totals
    buffer.writeln(_alignLeftRight('TOTAL NET:', '€ ${doc.totalNet.toStringAsFixed(2)}'));
    buffer.writeln(_alignLeftRight('TOTAL VAT TAX:', '€ ${doc.totalVat.toStringAsFixed(2)}'));
    buffer.writeln(_alignLeftRight('TOTAL GROSS (INCL):', '€ ${doc.totalGross.toStringAsFixed(2)}', isBoldIndicator: true));
    buffer.writeln(_divider('='));

    // 6. Compliant VAT Group breakdowns
    buffer.writeln('VAT BRACKETS SUMMARY:');
    buffer.writeln(_formatFourColumns('CODE/RATE', 'NET', 'TAX', 'GROSS', _lineWidth80mm));
    for (var tax in doc.taxBreakdown) {
      final codeRate = '(${tax.codeLetter}) ${(tax.rate * 100).toStringAsFixed(0)}%';
      buffer.writeln(_formatFourColumns(
        codeRate,
        '€ ${tax.net.toStringAsFixed(2)}',
        '€ ${tax.vat.toStringAsFixed(2)}',
        '€ ${tax.gross.toStringAsFixed(2)}',
        _lineWidth80mm
      ));
    }
    buffer.writeln(_divider('-'));

    // 7. Payment distribution
    buffer.writeln(_alignLeftRight('PAID VIA: ${doc.paymentMethodText.toUpperCase()}', '€ ${doc.totalGross.toStringAsFixed(2)}'));
    buffer.writeln(_divider('='));

    // 8. Belgium FDM Compliance Black Box signing block
    if (doc.fiscalInfo != null) {
      final fdm = doc.fiscalInfo!;
      buffer.writeln(_centerText('*** LEGAL FISCAL SIGNATURE ***', _lineWidth80mm));
      buffer.writeln(_alignLeftRight('FDM ID:', fdm.fdmSerialNumber));
      buffer.writeln(_alignLeftRight('SIG COUNTER:', fdm.signatureCounter.toString()));
      buffer.writeln('SECURITY SECURE HASH:');
      buffer.writeln(fdm.signatureHash);
      buffer.writeln(_centerText('LEGAL FISCAL RECEIPT', _lineWidth80mm));
      buffer.writeln(_divider('-'));
    }

    // 9. Centered footer logo
    buffer.writeln(_centerText('Thank you for your visit!', _lineWidth80mm));
    buffer.writeln(_centerText('Powered by PlatePixels', _lineWidth80mm));
    buffer.writeln('\n\n\n'); // Feed lines for paper tearing cut

    return buffer.toString();
  }

  // --- String Alignment Utilities for ESC/POS Standard Thermal Printers ---

  static String _centerText(String text, int width) {
    if (text.length >= width) return text.substring(0, width);
    final spaces = (width - text.length) ~/ 2;
    return ' ' * spaces + text;
  }

  static String _divider(String char) {
    return char * _lineWidth80mm;
  }

  static String _alignLeftRight(String left, String right, {bool isBoldIndicator = false}) {
    final int spaceLength = _lineWidth80mm - left.length - right.length;
    if (spaceLength <= 0) {
      return '$left $right';
    }
    final String line = left + (' ' * spaceLength) + right;
    return isBoldIndicator ? '** $line **' : line;
  }

  static String _formatThreeColumns(String col1, String col2, String col3, int width) {
    // Layout template: col1 (left alignment, width 24), col2 (mid, width 6), col3 (right, width 12)
    final String c1 = col1.length > 22 ? col1.substring(0, 22) : col1.padRight(22);
    final String c2 = col2.padRight(6);
    final String c3 = col3.padLeft(14);
    return c1 + c2 + c3;
  }

  static String _formatFourColumns(String col1, String col2, String col3, String col4, int width) {
    // Layout template for VAT matrix: col1 (12), col2 (10), col3 (10), col4 (10)
    final String c1 = col1.padRight(12);
    final String c2 = col2.padLeft(10);
    final String c3 = col3.padLeft(10);
    final String c4 = col4.padLeft(10);
    return c1 + c2 + c3 + c4;
  }
}
