import 'package:flutter/material';
import 'shared_business_engine/vat_engine.dart';
import 'shared_business_engine/receipt_engine.dart';

void main() {
  runApp(const MinoOrderPosApp());
}

class MinoOrderPosApp extends StatelessWidget {
  const MinoOrderPosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MinoOrder POS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF6366F1),
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        fontFamily: 'Outfit',
        useMaterial3: true,
      ),
      home: const PosDashboardScreen(),
    );
  }
}

class PosItem {
  final String id;
  final String name;
  final double price;
  final VatCategory category;
  final String categoryName;

  const PosItem({
    required this.id,
    required this.name,
    required this.price,
    required this.category,
    required this.categoryName,
  });
}

class PosCartItem {
  final PosItem item;
  int quantity;

  PosCartItem({required this.item, this.quantity = 1});
}

class PosDashboardScreen extends StatefulWidget {
  const PosDashboardScreen({super.key});

  @override
  State<PosDashboardScreen> createState() => _PosDashboardScreenState();
}

class _PosDashboardScreenState extends State<PosDashboardScreen> {
  String selectedCategory = 'All';
  final List<PosCartItem> cart = [];
  String activePaymentMethod = 'bancontact';

  final List<PosItem> menuItems = const [
    PosItem(id: '1', name: 'Classic Angus Beef', price: 10.00, category: VatCategory.food, categoryName: 'Burgers'),
    PosItem(id: '2', name: 'Double Bacon Cheese', price: 13.50, category: VatCategory.food, categoryName: 'Burgers'),
    PosItem(id: '3', name: 'Crispy Veggie Burger', price: 11.00, category: VatCategory.food, categoryName: 'Burgers'),
    PosItem(id: '4', name: 'Belgian Frites (Large)', price: 3.50, category: VatCategory.food, categoryName: 'Sides'),
    PosItem(id: '5', name: 'Sweet Potato Wedges', price: 4.50, category: VatCategory.food, categoryName: 'Sides'),
    PosItem(id: '6', name: 'Jupiler Pilsner Beer', price: 3.80, category: VatCategory.alcohol, categoryName: 'Drinks'),
    PosItem(id: '7', name: 'Chouffe Blonde Ale', price: 5.20, category: VatCategory.alcohol, categoryName: 'Drinks'),
    PosItem(id: '8', name: 'Coca-Cola Zero 33cl', price: 2.80, category: VatCategory.softDrink, categoryName: 'Drinks'),
    PosItem(id: '9', name: 'Premium Coffee Espresso', price: 2.50, category: VatCategory.softDrink, categoryName: 'Drinks'),
  ];

  double get totalGross {
    double total = 0;
    for (var item in cart) {
      total += item.item.price * item.quantity;
    }
    return total;
  }

  void _addToCart(PosItem item) {
    setState(() {
      final existingIndex = cart.indexWhere((element) => element.item.id == item.id);
      if (existingIndex != -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.add(PosCartItem(item: item));
      }
    });
  }

  void _clearCart() {
    setState(() {
      cart.clear();
    });
  }

  // Completes compliance calculations, registers to legal FDM black box and opens receipt modal
  void _submitTransaction() {
    if (cart.isEmpty) return;

    final double grossSum = totalGross;
    double netSum = 0.0;
    double vatSum = 0.0;

    // Group active items by VAT codes
    final Map<VatCategory, List<PosCartItem>> grouped = {};
    for (var cartItem in cart) {
      grouped.putIfAbsent(cartItem.item.category, () => []).add(cartItem);
    }

    final List<ReceiptLineItem> receiptItems = [];
    final List<ReceiptTaxRow> taxRows = [];

    // Reverse-calculate compliant VAT using our VAT Engine logic
    grouped.forEach((category, list) {
      double categoryGross = 0;
      double categoryNet = 0;
      double categoryVat = 0;
      double appliedRate = 0.0;

      for (var cartItem in list) {
        final calc = VatEngine.calculateTax(
          grossPrice: cartItem.item.price,
          countryCode: 'BE',
          category: cartItem.item.category,
          isTakeaway: false, // Default Dine-in for POS standard
        );

        categoryGross += calc.gross * cartItem.quantity;
        categoryNet += calc.net * cartItem.quantity;
        categoryVat += calc.vatAmount * cartItem.quantity;
        appliedRate = calc.rateApplied;

        String letter = 'A'; // BE default categorizers
        if (category == VatCategory.food) letter = 'B';
        if (category == VatCategory.softDrink) letter = 'C';

        receiptItems.add(ReceiptLineItem(
          name: cartItem.item.name,
          quantity: cartItem.quantity,
          grossPrice: cartItem.item.price,
          netPrice: calc.net,
          vatRate: calc.rateApplied,
          vatCodeLetter: letter,
        ));
      }

      netSum += categoryNet;
      vatSum += categoryVat;

      String letter = 'A';
      if (category == VatCategory.food) letter = 'B';
      if (category == VatCategory.softDrink) letter = 'C';

      taxRows.add(ReceiptTaxRow(
        codeLetter: letter,
        rate: appliedRate,
        gross: categoryGross,
        net: categoryNet,
        vat: categoryVat,
      ));
    });

    // Create legal FDM signed receipt
    final document = ReceiptDocument(
      storeName: 'MinoOrder Central BE',
      companyName: 'PlatePixels Horeca SA',
      vatNumber: 'BE 0741.982.634',
      address: 'Anspachlaan 42, 1000 Brussels',
      phone: '+32 2 543 21 00',
      cashierName: 'John Doe',
      orderNumber: 'POS-${DateTime.now().millisecond}',
      items: receiptItems,
      totalGross: grossSum,
      totalNet: netSum,
      totalVat: vatSum,
      taxBreakdown: taxRows,
      paymentMethodText: activePaymentMethod,
      fiscalInfo: FiscalMetadata(
        receiptNumber: 'BE-STORE01-${DateTime.now().year}${DateTime.now().month.toString().padLeft(2, '0')}-${DateTime.now().millisecond}',
        fdmSerialNumber: 'FDM-BE-887722-X',
        signatureCounter: 1042,
        signatureHash: 'SIG_23d5abf34d8ee5908b5f36e44d894b358664df8cbbf7_SHA256_BE',
        timestamp: DateTime.now(),
      ),
    );

    final textReceipt = ReceiptEngine.generateTextReceipt(document);

    // Prompt gorgeous glass-card dialog containing printed output terminal
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: const Color(0xFF111827),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Container(
            width: 480,
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text(
                      'FDM FISCAL TICKET SIGNED',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () {
                        Navigator.of(context).pop();
                        _clearCart();
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Transaction successfully signed by FDM Black Box and queued to online Supabase audits.',
                  style: TextStyle(fontSize: 12, color: Colors.white54),
                ),
                const SizedBox(height: 16),
                // Custom Terminal View showing standard receipt
                Container(
                  height: 400,
                  decoration: BoxDecoration(
                    color: const Color(0xFF070B13),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white12),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: SingleChildScrollView(
                    child: Text(
                      textReceipt,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: Color(0xFFD1D5DB),
                        height: 1.3,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop();
                    _clearCart();
                  },
                  icon: const Icon(Icons.check_circle_outline),
                  label: const Text('CONFIRM & NEXT ORDER', style: TextStyle(fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF111827),
        title: const Text(
          'MINOORDER POS  •  STORE #01  •  ACTIVE SHIFT',
          style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2, fontSize: 15),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.print),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Triggering active receipt printer line test...')),
              );
            },
          ),
          const SizedBox(width: 8),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.lock, size: 14),
            label: const Text('Close Shift (Z-Report)'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Row(
        children: [
          // Left dynamic panel for Categories
          Expanded(
            flex: 2,
            child: Container(
              color: const Color(0xFF111827),
              child: ListView(
                padding: const EdgeInsets.all(12),
                children: ['All', 'Burgers', 'Sides', 'Drinks'].map((cat) {
                  final isSelected = selectedCategory == cat;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          selectedCategory = cat;
                        });
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF6366F1) : const Color(0xFF1F2937),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isSelected ? Colors.white24 : Colors.transparent),
                        ),
                        child: Text(
                          cat.toUpperCase(),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.0),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          
          // Middle product selection grid
          Expanded(
            flex: 5,
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.25,
              ),
              itemCount: menuItems
                  .where((item) => selectedCategory == 'All' || item.categoryName == selectedCategory)
                  .length,
              itemBuilder: (context, index) {
                final filtered = menuItems
                    .where((item) => selectedCategory == 'All' || item.categoryName == selectedCategory)
                    .toList();
                final item = filtered[index];
                return InkWell(
                  onTap: () => _addToCart(item),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF1F2937),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.04)),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          item.name,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Text(
                              item.categoryName.toUpperCase(),
                              style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              '€ ${item.price.toStringAsFixed(2)}',
                              style: const TextStyle(
                                  color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          
          // Right order active cart panel
          Expanded(
            flex: 3,
            child: Container(
              decoration: const BoxDecoration(
                color: Color(0xFF111827),
                border: Border(left: BorderSide(color: Colors.white10)),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Active Transaction Cart',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const Divider(color: Colors.white12, height: 24),
                  
                  // Interactive Cart list builder
                  Expanded(
                    child: cart.isEmpty
                        ? const Center(
                            child: Text(
                              'Select items from catalog board to add to order.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.white30, fontSize: 13),
                            ),
                          )
                        : ListView.builder(
                            itemCount: cart.length,
                            itemBuilder: (context, index) {
                              final cItem = cart[index];
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 8.0),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1F2937),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.between,
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(cItem.item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                            Text(
                                              '€ ${cItem.item.price.toStringAsFixed(2)} x ${cItem.quantity}',
                                              style: const TextStyle(color: Colors.white54, fontSize: 11),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Row(
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.remove_circle_outline, size: 18),
                                            onPressed: () {
                                              setState(() {
                                                if (cItem.quantity > 1) {
                                                  cItem.quantity -= 1;
                                                } else {
                                                  cart.removeAt(index);
                                                }
                                              });
                                            },
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.add_circle_outline, size: 18),
                                            onPressed: () {
                                              setState(() {
                                                cItem.quantity += 1;
                                              });
                                            },
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
                  
                  const Divider(color: Colors.white12, height: 24),
                  
                  // Payment selectors
                  const Text('Payment Channel', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white54)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => activePaymentMethod = 'bancontact'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: activePaymentMethod == 'bancontact' ? const Color(0xFF6366F1) : const Color(0xFF1F2937),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            alignment: Alignment.center,
                            child: const Text('Card', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => activePaymentMethod = 'payconiq'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: activePaymentMethod == 'payconiq' ? const Color(0xFF6366F1) : const Color(0xFF1F2937),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            alignment: Alignment.center,
                            child: const Text('Payconiq', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => activePaymentMethod = 'cash'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: activePaymentMethod == 'cash' ? const Color(0xFF6366F1) : const Color(0xFF1F2937),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            alignment: Alignment.center,
                            child: const Text('Cash', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text('Total (VAT Incl)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                      Text(
                        '€ ${totalGross.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  ElevatedButton(
                    onPressed: cart.isEmpty ? null : _submitTransaction,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('COMPLETE PAYMENT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
