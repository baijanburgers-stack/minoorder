// vat_engine.dart
// Production-grade VAT Engine for MinoOrder Multi-Tenant Compliance

enum VatCategory { food, softDrink, alcohol, service }

class VatRule {
  final String country;
  final VatCategory category;
  final double takeawayRate; // e.g. 0.06 for 6%
  final double dineInRate;  // e.g. 0.12 for 12%

  const VatRule({
    required this.country,
    required this.category,
    required this.takeawayRate,
    required this.dineInRate,
  });
}

class VatResult {
  final double gross;
  final double net;
  final double vatAmount;
  final double rateApplied;

  const VatResult({
    required this.gross,
    required this.net,
    required this.vatAmount,
    required this.rateApplied,
  });

  Map<String, dynamic> toJson() => {
    'gross': gross,
    'net': net,
    'vatAmount': vatAmount,
    'rateApplied': rateApplied,
  };
}

class VatEngine {
  // Pre-configured official tax matrices (can be loaded dynamically from DB in production)
  static const Map<String, List<VatRule>> _countryRules = {
    'BE': [
      VatRule(country: 'BE', category: VatCategory.food, takeawayRate: 0.06, dineInRate: 0.12),
      VatRule(country: 'BE', category: VatCategory.softDrink, takeawayRate: 0.06, dineInRate: 0.12),
      VatRule(country: 'BE', category: VatCategory.alcohol, takeawayRate: 0.21, dineInRate: 0.21),
      VatRule(country: 'BE', category: VatCategory.service, takeawayRate: 0.21, dineInRate: 0.21),
    ],
    'DE': [
      VatRule(country: 'DE', category: VatCategory.food, takeawayRate: 0.07, dineInRate: 0.19),
      VatRule(country: 'DE', category: VatCategory.softDrink, takeawayRate: 0.19, dineInRate: 0.19),
      VatRule(country: 'DE', category: VatCategory.alcohol, takeawayRate: 0.19, dineInRate: 0.19),
      VatRule(country: 'DE', category: VatCategory.service, takeawayRate: 0.19, dineInRate: 0.19),
    ],
  };

  /// Calculates net and tax values given a VAT-inclusive gross price, country, item type, and service selection.
  static VatResult calculateTax({
    required double grossPrice,
    required String countryCode,
    required VatCategory category,
    required bool isTakeaway,
  }) {
    final rules = _countryRules[countryCode.toUpperCase()] ?? _countryRules['BE']!;
    final rule = rules.firstWhere(
      (r) => r.category == category,
      orElse: () => VatRule(country: countryCode, category: category, takeawayRate: 0.21, dineInRate: 0.21),
    );

    final double rate = isTakeaway ? rule.takeawayRate : rule.dineInRate;
    
    // Reverse-calculate net price from VAT-inclusive gross price
    final double net = grossPrice / (1.0 + rate);
    final double vatAmount = grossPrice - net;

    // Apply strict rounding to 4 decimal places for accuracy, final totals will round to 2
    return VatResult(
      gross: _round(grossPrice),
      net: _round(net),
      vatAmount: _round(vatAmount),
      rateApplied: rate,
    );
  }

  static double _round(double val) {
    return (val * 10000).roundToDouble() / 10000.0;
  }
}
