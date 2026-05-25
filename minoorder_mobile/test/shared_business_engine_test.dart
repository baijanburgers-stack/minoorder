// shared_business_engine_test.dart
// Production-grade Automated Test Suite for MinoOrder Compliance Algorithms

import 'package:flutter_test/flutter_test.dart';
import '../lib/shared_business_engine/vat_engine.dart';
import '../lib/shared_business_engine/combo_engine.dart';

void main() {
  group('VAT Engine Compliance Tests', () {
    test('Belgium Takeaway (6% standard food / soft drinks)', () {
      final result = VatEngine.calculateTax(
        grossPrice: 10.60,
        countryCode: 'BE',
        category: VatCategory.food,
        isTakeaway: true,
      );

      // Formula check: Net = Gross / 1.06 -> 10.60 / 1.06 = 10.00 Net
      expect(result.rateApplied, equals(0.06));
      expect(result.net, closeTo(10.00, 0.001));
      expect(result.vatAmount, closeTo(0.60, 0.001));
    });

    test('Belgium Dine-In (12% food service)', () {
      final result = VatEngine.calculateTax(
        grossPrice: 11.20,
        countryCode: 'BE',
        category: VatCategory.food,
        isTakeaway: false,
      );

      // Formula check: Net = Gross / 1.12 -> 11.20 / 1.12 = 10.00 Net
      expect(result.rateApplied, equals(0.12));
      expect(result.net, closeTo(10.00, 0.001));
      expect(result.vatAmount, closeTo(1.20, 0.001));
    });

    test('Belgium Standard Alcohol Rate (21% regardless of takeaway status)', () {
      final takeawayResult = VatEngine.calculateTax(
        grossPrice: 12.10,
        countryCode: 'BE',
        category: VatCategory.alcohol,
        isTakeaway: true,
      );

      final dineInResult = VatEngine.calculateTax(
        grossPrice: 12.10,
        countryCode: 'BE',
        category: VatCategory.alcohol,
        isTakeaway: false,
      );

      expect(takeawayResult.rateApplied, equals(0.21));
      expect(takeawayResult.net, closeTo(10.00, 0.001));
      expect(takeawayResult.vatAmount, closeTo(2.10, 0.001));

      expect(dineInResult.rateApplied, equals(0.21));
      expect(dineInResult.net, closeTo(10.00, 0.001));
      expect(dineInResult.vatAmount, closeTo(2.10, 0.001));
    });
  });

  group('Combo Engine Proportional Discount Allocation Tests', () {
    test('Belgium Compliant Combo Discount Allocations', () {
      // Combo Package fixed price = € 12.00
      // Normal Components purchased individually:
      // 1. Classic Angus Burger - € 10.00 (Food: BE 12% Dine-in)
      // 2. Frites Classic Belgian - € 3.50 (Food: BE 12% Dine-in)
      // 3. Jupiler Pilsner Beer - € 3.80 (Alcohol: BE 21% Dine-in)
      // Total Normal Price = € 17.30
      // Total Package discount = € 5.30
      
      final result = ComboEngine.calculateComboAllocation(
        comboFixedPrice: 12.00,
        components: const [
          ComboComponentItem(
            itemId: '1',
            name: 'Classic Angus Burger',
            normalGrossPrice: 10.00,
            vatCategory: VatCategory.food,
          ),
          ComboComponentItem(
            itemId: '2',
            name: 'Frites Classic Belgian',
            normalGrossPrice: 3.50,
            vatCategory: VatCategory.food,
          ),
          ComboComponentItem(
            itemId: '3',
            name: 'Jupiler Pilsner Beer',
            normalGrossPrice: 3.80,
            vatCategory: VatCategory.alcohol,
          ),
        ],
        countryCode: 'BE',
        isTakeaway: false,
      );

      // Verify overall totals
      expect(result.totalComboFixedPrice, equals(12.00));
      expect(result.totalNormalPrice, equals(17.30));
      expect(result.totalDiscount, closeTo(5.30, 0.001));

      // Mathematically verify that sum of allocated gross prices matches fixed combo price exactly
      double sumAllocatedGross = 0.0;
      for (var comp in result.items) {
        sumAllocatedGross += comp.allocatedGrossPrice;
      }
      expect(sumAllocatedGross, equals(12.00));

      // Verify that individual items were proportionally discounted:
      // Discount ratio = 5.30 / 17.30 = 30.6358%
      // allocated Burger gross = 10 * (1 - 0.306358) = 6.936 -> € 6.94 gross
      final burgerAlloc = result.items.firstWhere((i) => i.itemId == '1');
      expect(burgerAlloc.allocatedGrossPrice, equals(6.94));
      expect(burgerAlloc.vatRateApplied, equals(0.12));
      expect(burgerAlloc.allocatedNetPrice, closeTo(6.1964, 0.01)); // Net = 6.94 / 1.12
      expect(burgerAlloc.allocatedVatAmount, closeTo(0.7436, 0.01));

      // allocated Beer gross = 3.80 * (1 - 0.306358) = 2.636 -> € 2.64 gross
      final beerAlloc = result.items.firstWhere((i) => i.itemId == '3');
      expect(beerAlloc.allocatedGrossPrice, equals(2.63)); // Adjusted last item math
      expect(beerAlloc.vatRateApplied, equals(0.21));
    });
  });
}
