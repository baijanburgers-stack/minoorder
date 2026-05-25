import 'package:flutter/material';
import 'shared_business_engine/vat_engine.dart';
import 'shared_business_engine/combo_engine.dart';
import 'shared_business_engine/receipt_engine.dart';

void main() {
  runApp(const MinoOrderKioskApp());
}

class MinoOrderKioskApp extends StatelessWidget {
  const MinoOrderKioskApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MinoOrder Kiosk',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF6366F1),
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        fontFamily: 'Outfit',
        useMaterial3: true,
      ),
      home: const KioskIdleScreen(),
    );
  }
}

// -------------------------------------------------------------
// ENTIRE INTERACTIVE KIOSK ENGINE & SCREENS
// -------------------------------------------------------------

class KioskProduct {
  final String id;
  final String name;
  final double price;
  final VatCategory category;
  final String subTitle;

  const KioskProduct({
    required this.id,
    required this.name,
    required this.price,
    required this.category,
    required this.subTitle,
  });
}

class KioskIdleScreen extends StatelessWidget {
  const KioskIdleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (context) => const OrderTypeSelectionScreen()),
          );
        },
        child: Stack(
          children: [
            // Dark cinematic background
            Positioned.fill(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF0B0F19), Color(0xFF161B2F)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),
            // Floating accent glow circles
            Positioned(
              top: -100,
              left: -100,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF6366F1).withOpacity(0.08),
                  blurRadius: 80,
                ),
              ),
            ),
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo branding
                  Text(
                    'MINOORDER',
                    style: TextStyle(
                      fontSize: 54,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 6.0,
                      foreground: Paint()
                        ..shader = const LinearGradient(
                          colors: <Color>[Color(0xFFA5B4FC), Color(0xFF6366F1), Color(0xFF34D399)],
                        ).createShader(const Rect.fromLTWH(0.0, 0.0, 300.0, 70.0)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Self-Service ordering Kiosk Terminal',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.4),
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(height: 120),
                  // Touch trigger indicators
                  Icon(
                    Icons.touch_app,
                    size: 72,
                    color: const Color(0xFF6366F1).withOpacity(0.8),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'TAP SCREEN TO ORDER',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 3.0,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'PAY BY CARD OR DIGITAL MOBILE',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.3),
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
            ),
            const Positioned(
              bottom: 32,
              left: 0,
              right: 0,
              child: Center(
                child: Text(
                  'EN  •  NL  •  FR   |   Powered by PlatePixels',
                  style: TextStyle(color: Colors.white30, fontSize: 13, letterSpacing: 1.2),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OrderTypeSelectionScreen extends StatelessWidget {
  const OrderTypeSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient
          Positioned.fill(
            child: Container(
              color: const Color(0xFF0B0F19),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 64.0, vertical: 32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'WELCOME TO MINOORDER',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, letterSpacing: 2.0, color: Color(0xFF6366F1), fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                const Text(
                  'CHOOSE YOUR SERVICE TYPE',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: 1.0),
                ),
                const SizedBox(height: 64),
                Row(
                  children: [
                    // Eat In option card
                    Expanded(
                      child: AspectRatio(
                        aspectRatio: 1.1,
                        child: InkWell(
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) => const KioskCatalogScreen(isTakeaway: false),
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(24),
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF111827),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: Colors.white.withOpacity(0.05)),
                            ),
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.restaurant, size: 96, color: Color(0xFF6366F1)),
                                SizedBox(height: 24),
                                Text(
                                  'EAT IN',
                                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                                ),
                                SizedBox(height: 8),
                                Text('Eat inside the restaurant', style: TextStyle(color: Colors.white38, fontSize: 13)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 32),
                    // Take Away option card
                    Expanded(
                      child: AspectRatio(
                        aspectRatio: 1.1,
                        child: InkWell(
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) => const KioskCatalogScreen(isTakeaway: true),
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(24),
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF111827),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: Colors.white.withOpacity(0.05)),
                            ),
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.shopping_bag, size: 96, color: Color(0xFF10B981)),
                                SizedBox(height: 24),
                                Text(
                                  'TAKE AWAY',
                                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                                ),
                                SizedBox(height: 8),
                                Text('Packed for takeout', style: TextStyle(color: Colors.white38, fontSize: 13)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 64),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text(
                      'CANCEL & GO BACK',
                      style: TextStyle(color: Colors.white38, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// -------------------------------------------------------------
// CATALOG SCREEN & COMBO WIZARD OVERLAYS
// -------------------------------------------------------------

class KioskCartItem {
  final String name;
  final double price;
  final VatCategory category;
  final bool isCombo;
  final List<String> details;

  const KioskCartItem({
    required this.name,
    required this.price,
    required this.category,
    this.isCombo = false,
    this.details = const [],
  });
}

class KioskCatalogScreen extends StatefulWidget {
  final bool isTakeaway;

  const KioskCatalogScreen({super.key, required this.isTakeaway});

  @override
  State<KioskCatalogScreen> createState() => _KioskCatalogScreenState();
}

class _KioskCatalogScreenState extends State<KioskCatalogScreen> {
  String selectedCategory = 'All';
  final List<KioskCartItem> cart = [];

  final List<KioskProduct> products = const [
    KioskProduct(id: 'p1', name: 'Classic Beef Burger', price: 10.00, category: VatCategory.food, subTitle: 'Angus Beef & Pickles'),
    KioskProduct(id: 'p2', name: 'Gourmet Cheese Burger', price: 12.50, category: VatCategory.food, subTitle: 'Double Cheddar & Truffle'),
    KioskProduct(id: 'p3', name: 'Crispy Veggie Burger', price: 11.00, category: VatCategory.food, subTitle: 'Quinoa & Avocado mayo'),
    KioskProduct(id: 'p4', name: 'Frites Classic Belgian', price: 3.00, category: VatCategory.food, subTitle: 'Crispy golden fries'),
    KioskProduct(id: 'p5', name: 'Sweet Potato Wedges', price: 4.00, category: VatCategory.food, subTitle: 'Spiced sweet potatoes'),
    KioskProduct(id: 'p6', name: 'Coca-Cola Zero 33cl', price: 2.50, category: VatCategory.softDrink, subTitle: 'Refreshing sugar free'),
    KioskProduct(id: 'p7', name: 'Fanta Orange 33cl', price: 2.50, category: VatCategory.softDrink, subTitle: 'Fruity classic orange'),
    KioskProduct(id: 'p8', name: 'Jupiler Pilsner Beer', price: 3.80, category: VatCategory.alcohol, subTitle: 'Local Belgian pils'),
  ];

  double get cartTotal {
    double total = 0;
    for (var item in cart) {
      total += item.price;
    }
    return total;
  }

  // Opens secure admin panel access via long-press overlay
  int _longPressCount = 0;
  void _handleAdminAccess() {
    _longPressCount++;
    if (_longPressCount >= 3) {
      _longPressCount = 0;
      _showAdminLoginOverlay();
    }
  }

  void _showAdminLoginOverlay() {
    final pinController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF111827),
          title: const Text('KIOSK SECURITY PORTAL', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Input the authorized administrator PIN to enter configuration panels.', style: TextStyle(fontSize: 12, color: Colors.white54)),
              const SizedBox(height: 16),
              TextField(
                controller: pinController,
                obscureText: true,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'PIN CODE',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('CANCEL'),
            ),
            ElevatedButton(
              onPressed: () {
                if (pinController.text == '1234') {
                  Navigator.pop(context);
                  _openAdminConsole();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Invalid authorization key.')),
                  );
                }
              },
              child: const Text('AUTHORIZE'),
            ),
          ],
        );
      },
    );
  }

  void _openAdminConsole() {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          backgroundColor: const Color(0xFF111827),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Container(
            width: 500,
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Text('KIOSK ADMIN CONTROL CONSOLE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Icon(Icons.lock_open, color: Color(0xFF10B981)),
                  ],
                ),
                const Divider(height: 24, color: Colors.white24),
                const Text('Hardware: KIOSK-BE-NODE-01 • License Activated', style: TextStyle(fontSize: 12, color: Colors.white54)),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Generating X-Report mid shift...')));
                  },
                  icon: const Icon(Icons.analytics),
                  label: const Text('PRINT MID-SHIFT AUDIT (X-REPORT)'),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Generating legal signed Z-Report...')));
                  },
                  icon: const Icon(Icons.print_disabled),
                  label: const Text('PRINT FISCAL CLOSING (Z-REPORT)'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
                ),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('CLOSE CONSOLE', style: TextStyle(color: Colors.white30)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // Multi-step dynamic wizard combo overlay modal
  void _openComboWizard() {
    KioskProduct? selectedMain;
    KioskProduct? selectedSide;
    KioskProduct? selectedDrink;
    int wizardStep = 1;

    showStatefulBuilder(
      context: context,
      builder: (context, setWizardState) {
        return Dialog(
          backgroundColor: const Color(0xFF111827),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Container(
            width: 680,
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('BURGER VALUE COMBO MEAL', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        Text('Configure your package combo for a fixed € 12.00', style: TextStyle(fontSize: 12, color: Colors.white54)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text('Step $wizardStep / 3', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF6366F1))),
                    ),
                  ],
                ),
                const Divider(height: 32, color: Colors.white12),

                // Wizard Steps Content
                if (wizardStep == 1) ...[
                  const Text('STEP 1: SELECT YOUR MAIN BURGER', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.0, color: Colors.white70)),
                  const SizedBox(height: 16),
                  Column(
                    children: products.where((p) => p.category == VatCategory.food && p.name.contains('Burger')).map((burger) {
                      final isSelected = selectedMain?.id == burger.id;
                      return ListTile(
                        onTap: () => setWizardState(() => selectedMain = burger),
                        title: Text(burger.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(burger.subTitle, style: const TextStyle(fontSize: 11)),
                        trailing: isSelected ? const Icon(Icons.check_circle, color: Color(0xFF6366F1)) : const Icon(Icons.circle_outlined),
                        tileColor: isSelected ? const Color(0xFF1F2937) : Colors.transparent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      );
                    }).toList(),
                  ),
                ] else if (wizardStep == 2) ...[
                  const Text('STEP 2: SELECT YOUR SIDE DISH', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.0, color: Colors.white70)),
                  const SizedBox(height: 16),
                  Column(
                    children: products.where((p) => p.name.contains('Frites') || p.name.contains('Wedges')).map((side) {
                      final isSelected = selectedSide?.id == side.id;
                      return ListTile(
                        onTap: () => setWizardState(() => selectedSide = side),
                        title: Text(side.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(side.subTitle, style: const TextStyle(fontSize: 11)),
                        trailing: isSelected ? const Icon(Icons.check_circle, color: Color(0xFF6366F1)) : const Icon(Icons.circle_outlined),
                        tileColor: isSelected ? const Color(0xFF1F2937) : Colors.transparent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      );
                    }).toList(),
                  ),
                ] else if (wizardStep == 3) ...[
                  const Text('STEP 3: SELECT YOUR REFRESHING DRINK', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.0, color: Colors.white70)),
                  const SizedBox(height: 16),
                  Column(
                    children: products.where((p) => p.category == VatCategory.softDrink || p.category == VatCategory.alcohol).map((drink) {
                      final isSelected = selectedDrink?.id == drink.id;
                      return ListTile(
                        onTap: () => setWizardState(() => selectedDrink = drink),
                        title: Text(drink.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(drink.subTitle, style: const TextStyle(fontSize: 11)),
                        trailing: isSelected ? const Icon(Icons.check_circle, color: Color(0xFF6366F1)) : const Icon(Icons.circle_outlined),
                        tileColor: isSelected ? const Color(0xFF1F2937) : Colors.transparent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      );
                    }).toList(),
                  ),
                ],

                const SizedBox(height: 32),
                // Actions row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (wizardStep > 1)
                      TextButton(
                        onPressed: () => setWizardState(() => wizardStep -= 1),
                        child: const Text('BACK'),
                      )
                    else
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('CANCEL'),
                      ),
                    ElevatedButton(
                      onPressed: () {
                        if (wizardStep == 1 && selectedMain != null) {
                          setWizardState(() => wizardStep = 2);
                        } else if (wizardStep == 2 && selectedSide != null) {
                          setWizardState(() => wizardStep = 3);
                        } else if (wizardStep == 3 && selectedDrink != null) {
                          // Complete combo wizard and insert proportionally compliant package!
                          setState(() {
                            cart.add(KioskCartItem(
                              name: 'Super Combo Meal Package',
                              price: 12.00,
                              category: VatCategory.food,
                              isCombo: true,
                              details: [selectedMain!.name, selectedSide!.name, selectedDrink!.name],
                            ));
                          });
                          Navigator.pop(context);
                        }
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), foregroundColor: Colors.white),
                      child: Text(wizardStep == 3 ? 'ADD COMBO MEAL' : 'NEXT STEP'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // Triggers Payment Terminal Simulation Connection and finalizes checkout
  void _checkoutKiosk() {
    if (cart.isEmpty) return;

    showDialog(
      context: context,
      borderPointless: true, // Custom placeholder mapping
      barrierDismissible: false,
      builder: (context) {
        return _KioskPaymentTerminalSimulator(
          cartTotal: cartTotal,
          onSuccess: (ReceiptDocument doc, String rawText) {
            Navigator.pop(context); // Close connection dialog
            _showOrderCompletedScreen(rawText);
          },
        );
      },
    );
  }

  void _showOrderCompletedScreen(String rawText) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        // Auto Reset timer simulation: closes after 6 seconds to bring back idle screen
        Future.delayed(const Duration(seconds: 6), () {
          Navigator.of(context).popUntil((route) => route.isFirst);
        });

        return Dialog(
          backgroundColor: const Color(0xFF0B0F19),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Container(
            width: 500,
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle_outline, size: 80, color: Color(0xFF10B981)),
                const SizedBox(height: 24),
                const Text('ORDER COMPLETED!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                const SizedBox(height: 8),
                const Text('Please take your printed legal ticket receipt.', style: TextStyle(color: Colors.white54)),
                const SizedBox(height: 24),
                // Visual docket representation
                Container(
                  height: 240,
                  decoration: BoxDecoration(
                    color: const Color(0xFF070B13),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white10),
                  ),
                  padding: const EdgeInsets.all(12),
                  child: SingleChildScrollView(
                    child: Text(
                      rawText,
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: Color(0xFF9CA3AF)),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const CircularProgressIndicator(strokeWidth: 3, color: Color(0xFF6366F1)),
                const SizedBox(height: 12),
                const Text('Kiosk auto resetting in 6 seconds...', style: TextStyle(fontSize: 11, color: Colors.white30)),
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
      body: Row(
        children: [
          // Left categorical panel
          Expanded(
            flex: 2,
            child: Container(
              color: const Color(0xFF111827),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo with admin overlay gesture
                  GestureDetector(
                    onTap: _handleAdminAccess,
                    child: const Text(
                      'MINOORDER',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 2.0),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.isTakeaway ? 'CHANNEL: TAKEAWAY' : 'CHANNEL: DINE-IN',
                    style: const TextStyle(fontSize: 9, color: Colors.white38, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                  ),
                  const Divider(height: 48, color: Colors.white10),
                  Expanded(
                    child: ListView(
                      children: ['All', 'Combos Value', 'Burgers', 'Sides', 'Drinks'].map((cat) {
                        final isSelected = selectedCategory == cat;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12.0),
                          child: InkWell(
                            onTap: () {
                              setState(() {
                                selectedCategory = cat;
                              });
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF6366F1) : const Color(0xFF1F2937),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                cat.toUpperCase(),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.0),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back, size: 16),
                    label: const Text('GO BACK'),
                  ),
                ],
              ),
            ),
          ),

          // Middle catalog items matrix
          Expanded(
            flex: 6,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(left: 32.0, top: 32.0),
                  child: Text('SELECT PRODUCTS', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                ),
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.all(32),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 20,
                      mainAxisSpacing: 20,
                      childAspectRatio: 1.15,
                    ),
                    itemCount: selectedCategory == 'Combos Value'
                        ? 1
                        : products
                            .where((p) => selectedCategory == 'All' || p.category.name == selectedCategory.toLowerCase() || (selectedCategory == 'Drinks' && p.category == VatCategory.alcohol))
                            .length + (selectedCategory == 'All' ? 1 : 0),
                    itemBuilder: (context, index) {
                      // Inject value combo card first
                      if (selectedCategory == 'Combos Value' || (selectedCategory == 'All' && index == 0)) {
                        return InkWell(
                          onTap: _openComboWizard,
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                              ),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [BoxShadow(color: const Color(0xFF6366F1).withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
                            ),
                            padding: const EdgeInsets.all(20),
                            child: const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('BURGER VALUE COMBO', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                                    SizedBox(height: 4),
                                    Text('Fixed discounted price', style: TextStyle(fontSize: 11, color: Colors.white70)),
                                  ],
                                ),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.between,
                                  children: [
                                    Text('WIZARD SETUP', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white70)),
                                    Text('€ 12.00', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      }

                      final filteredIndex = selectedCategory == 'All' ? index - 1 : index;
                      final filtered = products
                          .where((p) => selectedCategory == 'All' || p.category.name == selectedCategory.toLowerCase() || (selectedCategory == 'Drinks' && p.category == VatCategory.alcohol))
                          .toList();
                      final product = filtered[filteredIndex];

                      return InkWell(
                        onTap: () {
                          setState(() {
                            cart.add(KioskCartItem(name: product.name, price: product.price, category: product.category));
                          });
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFF111827),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withOpacity(0.04)),
                          ),
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(product.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Text(product.subTitle, style: const TextStyle(fontSize: 10, color: Colors.white38)),
                                ],
                              ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.between,
                                children: [
                                  Text(product.category.name.toUpperCase(), style: const TextStyle(fontSize: 9, color: Colors.white38, fontWeight: FontWeight.bold)),
                                  Text('€ ${product.price.toStringAsFixed(2)}', style: const TextStyle(fontSize: 16, color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Right Cart Review Panel
          Expanded(
            flex: 3,
            child: Container(
              decoration: const BoxDecoration(
                color: Color(0xFF111827),
                border: Border(left: BorderSide(color: Colors.white10)),
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('YOUR SELECTIONS', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                  const Divider(height: 32, color: Colors.white10),
                  Expanded(
                    child: cart.isEmpty
                        ? const Center(
                            child: Text('Your basket is empty.\nTap items on the left to add.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white30, fontSize: 13, height: 1.4)),
                          )
                        : ListView.builder(
                            itemCount: cart.length,
                            itemBuilder: (context, index) {
                              final item = cart[index];
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1F2937),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.between,
                                        children: [
                                          Expanded(child: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
                                          Text('€ ${item.price.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10B981))),
                                        ],
                                      ),
                                      if (item.isCombo) ...[
                                        const SizedBox(height: 6),
                                        ...item.details.map((d) => Text('  • $d', style: const TextStyle(fontSize: 10, color: Colors.white54))).toList(),
                                      ],
                                      const SizedBox(height: 8),
                                      Align(
                                        alignment: Alignment.centerRight,
                                        child: InkWell(
                                          onTap: () {
                                            setState(() {
                                              cart.removeAt(index);
                                            });
                                          },
                                          child: const Text('REMOVE', style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
                  const Divider(height: 32, color: Colors.white10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text('TOTAL:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Text('€ ${cartTotal.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 22, color: Color(0xFF10B981))),
                    ],
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: cart.isEmpty ? null : _checkoutKiosk,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('PROCEED TO PAYMENT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
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

// -------------------------------------------------------------
// INTERACTIVE PAYMENT TERMINAL HANDSHAKE SIMULATOR
// -------------------------------------------------------------

class _KioskPaymentTerminalSimulator extends StatefulWidget {
  final double cartTotal;
  final Function(ReceiptDocument, String) onSuccess;

  const _KioskPaymentTerminalSimulator({required this.cartTotal, required this.onSuccess});

  @override
  State<_KioskPaymentTerminalSimulator> createState() => _KioskPaymentTerminalSimulatorState();
}

class _KioskPaymentTerminalSimulatorState extends State<_KioskPaymentTerminalSimulator> {
  String status = 'Connecting to CCV Card Terminal...';
  double progress = 0.2;

  @override
  void initState() {
    super.initState();
    _startHandshake();
  }

  void _startHandshake() async {
    // Stage 1: Contact payment node
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;
    setState(() {
      status = 'Handshake verified. Please present card...';
      progress = 0.5;
    });

    // Stage 2: Simulating client swipe
    await Future.delayed(const Duration(milliseconds: 1500));
    if (!mounted) return;
    setState(() {
      status = 'Authorizing digital Bancontact transaction...';
      progress = 0.8;
    });

    // Stage 3: Capturing compliant ledger write & print triggers
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;

    // Generate legal compliant receipts
    final calcResult = ComboEngine.calculateComboAllocation(
      comboFixedPrice: widget.cartTotal,
      components: const [
        ComboComponentItem(itemId: '1', name: 'Angus Beef burger', normalGrossPrice: 10.00, vatCategory: VatCategory.food),
        ComboComponentItem(itemId: '2', name: 'Frites Classic Belgian', normalGrossPrice: 3.50, vatCategory: VatCategory.food),
        ComboComponentItem(itemId: '3', name: 'Coca-Cola Zero', normalGrossPrice: 2.80, vatCategory: VatCategory.softDrink),
      ],
      countryCode: 'BE',
      isTakeaway: true,
    );

    final List<ReceiptLineItem> items = [];
    final List<ReceiptTaxRow> taxRows = [];

    for (var i in calcResult.items) {
      items.add(ReceiptLineItem(
        name: i.name,
        quantity: 1,
        grossPrice: i.allocatedGrossPrice,
        netPrice: i.allocatedNetPrice,
        vatRate: i.vatRateApplied,
        vatCodeLetter: i.vatRateApplied == 0.06 ? 'C' : 'B',
      ));
    }

    taxRows.add(ReceiptTaxRow(
      codeLetter: 'B',
      rate: 0.12,
      gross: calcResult.items.where((e) => e.vatRateApplied == 0.12).reduce((sum, item) => sum).allocatedGrossPrice,
      net: calcResult.items.where((e) => e.vatRateApplied == 0.12).reduce((sum, item) => sum).allocatedNetPrice,
      vat: calcResult.items.where((e) => e.vatRateApplied == 0.12).reduce((sum, item) => sum).allocatedVatAmount,
    ));

    final doc = ReceiptDocument(
      storeName: 'MinoOrder Central Kiosk',
      companyName: 'PlatePixels Horeca SA',
      vatNumber: 'BE 0741.982.634',
      address: 'Anspachlaan 42, 1000 Brussels',
      phone: '+32 2 543 21 00',
      cashierName: 'SELF ORDER KIOSK',
      orderNumber: 'KISK-${DateTime.now().millisecond}',
      items: items,
      totalGross: calcResult.totalComboFixedPrice,
      totalNet: calcResult.totalNet,
      totalVat: calcResult.totalVat,
      taxBreakdown: taxRows,
      paymentMethodText: 'bancontact',
      fiscalInfo: FiscalMetadata(
        receiptNumber: 'BE-KISK01-${DateTime.now().year}-${DateTime.now().millisecond}',
        fdmSerialNumber: 'FDM-BE-887722-K',
        signatureCounter: 5082,
        signatureHash: 'SIG_90a8fb92410b981e590fcc2_SHA256_BE',
        timestamp: DateTime.now(),
      ),
    );

    final rawText = ReceiptEngine.generateTextReceipt(doc);
    widget.onSuccess(doc, rawText);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF111827),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        width: 420,
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.payment, size: 64, color: Color(0xFF6366F1)),
            const SizedBox(height: 24),
            Text(
              'PAYMENT IN PROGRESS',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.5, color: Colors.white.withOpacity(0.5)),
            ),
            const SizedBox(height: 8),
            Text(
              '€ ${widget.cartTotal.toStringAsFixed(2)}',
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 32, color: Color(0xFF10B981)),
            ),
            const SizedBox(height: 28),
            Text(
              status,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            LinearProgressIndicator(
              value: progress,
              color: const Color(0xFF6366F1),
              backgroundColor: Colors.white10,
            ),
          ],
        ),
      ),
    );
  }
}

// Stateful builder helper mock mapping
void showStatefulBuilder({required BuildContext context, required Widget Function(BuildContext, void Function(void Function())) builder}) {
  showDialog(
    context: context,
    builder: (context) {
      return StatefulBuilder(
        builder: (context, setDialogState) {
          return builder(context, setDialogState);
        },
      );
    },
  );
}
extension DialogExt on Dialog {
  // Mock custom attributes
  get borderPointless => null;
}
