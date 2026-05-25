// combo_engine.dart
// Production-grade Combo Discount & VAT Allocation Engine for MinoOrder

import 'vat_engine.dart';

class ComboComponentItem {
  final String itemId;
  final String name;
  final double normalGrossPrice;
  final VatCategory vatCategory;

  const ComboComponentItem({
    required this.itemId,
    required this.name,
    required this.normalGrossPrice,
    required this.vatCategory,
  });
}

class AllocatedComboItemResult {
  final String itemId;
  final String name;
  final double normalGrossPrice;
  final double allocatedGrossPrice;
  final double allocatedNetPrice;
  final double allocatedVatAmount;
  final double vatRateApplied;

  const AllocatedComboItemResult({
    required this.itemId,
    required this.name,
    required this.normalGrossPrice,
    required this.allocatedGrossPrice,
    required this.allocatedNetPrice,
    required this.allocatedVatAmount,
    required this.vatRateApplied,
  });

  Map<String, dynamic> toJson() => {
    'itemId': itemId,
    'name': name,
    'normalGrossPrice': normalGrossPrice,
    'allocatedGrossPrice': allocatedGrossPrice,
    'allocatedNetPrice': allocatedNetPrice,
    'allocatedVatAmount': allocatedVatAmount,
    'vatRateApplied': vatRateApplied,
  };
}

class ComboCalculationResult {
  final double totalComboFixedPrice;
  final double totalNormalPrice;
  final double totalDiscount;
  final double totalNet;
  final double totalVat;
  final List<AllocatedComboItemResult> items;

  const ComboCalculationResult({
    required this.totalComboFixedPrice,
    required this.totalNormalPrice,
    required this.totalDiscount,
    required this.totalNet,
    required this.totalVat,
    required this.items,
  });

  Map<String, dynamic> toJson() => {
    'totalComboFixedPrice': totalComboFixedPrice,
    'totalNormalPrice': totalNormalPrice,
    'totalDiscount': totalDiscount,
    'totalNet': totalNet,
    'totalVat': totalVat,
    'items': items.map((i) => i.toJson()).toList(),
  };
}

class ComboEngine {
  /// Allocates combo discount and extracts VAT proportionally across components to satisfy legal compliance.
  static ComboCalculationResult calculateComboAllocation({
    required double comboFixedPrice,
    required List<ComboComponentItem> components,
    required String countryCode,
    required bool isTakeaway,
  }) {
    // 1. Calculate the total sum of normal prices
    double totalNormalPrice = 0.0;
    for (var comp in components) {
      totalNormalPrice += comp.normalGrossPrice;
    }

    // 2. Determine the discount
    double totalDiscount = totalNormalPrice - comboFixedPrice;
    if (totalDiscount < 0) totalDiscount = 0.0; // No discount if fixed price is higher

    // 3. Compute discount ratio
    double discountRatio = totalNormalPrice > 0 ? (totalDiscount / totalNormalPrice) : 0.0;

    List<AllocatedComboItemResult> allocatedItems = [];
    double calculatedTotalNet = 0.0;
    double calculatedTotalVat = 0.0;

    // 4. Distribute discount proportionally across each item's VAT category
    for (int i = 0; i < components.length; i++) {
      final comp = components[i];
      
      // Calculate allocated gross price for this component
      double allocatedGross = comp.normalGrossPrice * (1.0 - discountRatio);

      // Handle precision rounding adjustments on the last element to prevent rounding loss
      if (i == components.length - 1) {
        double currentAllocatedSum = 0.0;
        for (var item in allocatedItems) {
          currentAllocatedSum += item.allocatedGrossPrice;
        }
        allocatedGross = comboFixedPrice - currentAllocatedSum;
      }
      
      allocatedGross = _roundToTwoDecimals(allocatedGross);

      // 5. Query the VAT Engine for tax extraction based on this custom allocated gross price
      final vatCalculation = VatEngine.calculateTax(
        grossPrice: allocatedGross,
        countryCode: countryCode,
        category: comp.vatCategory,
        isTakeaway: isTakeaway,
      );

      allocatedItems.add(
        AllocatedComboItemResult(
          itemId: comp.itemId,
          name: comp.name,
          normalGrossPrice: comp.normalGrossPrice,
          allocatedGrossPrice: allocatedGross,
          allocatedNetPrice: vatCalculation.net,
          allocatedVatAmount: vatCalculation.vatAmount,
          vatRateApplied: vatCalculation.rateApplied,
        ),
      );

      calculatedTotalNet += vatCalculation.net;
      calculatedTotalVat += vatCalculation.vatAmount;
    }

    return ComboCalculationResult(
      totalComboFixedPrice: comboFixedPrice,
      totalNormalPrice: totalNormalPrice,
      totalDiscount: totalDiscount,
      totalNet: _roundToTwoDecimals(calculatedTotalNet),
      totalVat: _roundToTwoDecimals(calculatedTotalVat),
      items: allocatedItems,
    );
  }

  static double _roundToTwoDecimals(double val) {
    return (val * 100).roundToDouble() / 100.0;
  }
}
