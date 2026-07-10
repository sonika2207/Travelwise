package com.travelplanner.packing.config;

import com.travelplanner.packing.entity.ConditionType;
import com.travelplanner.packing.entity.Operator;
import com.travelplanner.packing.entity.PackingRule;
import com.travelplanner.packing.repository.PackingRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds default packing rules on first startup.
 * Runs only when the packing_rules table is empty.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PackingRuleSeeder implements CommandLineRunner {

    private final PackingRuleRepository packingRuleRepository;

    @Override
    public void run(String... args) {
        if (packingRuleRepository.count() > 0) {
            log.info("Packing rules already seeded – skipping.");
            return;
        }

        List<PackingRule> defaultRules = List.of(

            // ---- Temperature – cold ----
            PackingRule.builder()
                .conditionType(ConditionType.AVG_TEMP)
                .operator(Operator.LESS_THAN)
                .thresholdValue(15.0)
                .suggestedItem("Jacket")
                .category("Clothing")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.AVG_TEMP)
                .operator(Operator.LESS_THAN)
                .thresholdValue(10.0)
                .suggestedItem("Thermal Underwear")
                .category("Clothing")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.AVG_TEMP)
                .operator(Operator.LESS_THAN)
                .thresholdValue(5.0)
                .suggestedItem("Heavy Winter Coat")
                .category("Clothing")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.MIN_TEMP)
                .operator(Operator.LESS_THAN)
                .thresholdValue(0.0)
                .suggestedItem("Gloves")
                .category("Accessories")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.MIN_TEMP)
                .operator(Operator.LESS_THAN)
                .thresholdValue(0.0)
                .suggestedItem("Woollen Hat")
                .category("Accessories")
                .build(),

            // ---- Temperature – hot ----
            PackingRule.builder()
                .conditionType(ConditionType.AVG_TEMP)
                .operator(Operator.GREATER_THAN)
                .thresholdValue(30.0)
                .suggestedItem("Sunscreen SPF 50")
                .category("Health & Hygiene")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.AVG_TEMP)
                .operator(Operator.GREATER_THAN)
                .thresholdValue(30.0)
                .suggestedItem("Sunglasses")
                .category("Accessories")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.AVG_TEMP)
                .operator(Operator.GREATER_THAN)
                .thresholdValue(28.0)
                .suggestedItem("Light Cotton T-shirts")
                .category("Clothing")
                .build(),

            // ---- Rain ----
            PackingRule.builder()
                .conditionType(ConditionType.RAIN_CHANCE)
                .operator(Operator.GREATER_THAN)
                .thresholdValue(40.0)
                .suggestedItem("Umbrella")
                .category("Accessories")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.RAIN_CHANCE)
                .operator(Operator.GREATER_THAN)
                .thresholdValue(60.0)
                .suggestedItem("Rain Poncho")
                .category("Clothing")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.RAIN_CHANCE)
                .operator(Operator.GREATER_THAN)
                .thresholdValue(40.0)
                .suggestedItem("Waterproof Shoes")
                .category("Footwear")
                .build(),

            // ---- Humidity ----
            PackingRule.builder()
                .conditionType(ConditionType.HUMIDITY)
                .operator(Operator.GREATER_THAN)
                .thresholdValue(75.0)
                .suggestedItem("Anti-humidity Hair Products")
                .category("Health & Hygiene")
                .build(),

            // ---- Trip type – ADVENTURE ----
            PackingRule.builder()
                .conditionType(ConditionType.TRIP_TYPE)
                .operator(Operator.EQUAL)
                .thresholdText("ADVENTURE")
                .suggestedItem("First Aid Kit")
                .category("Health & Hygiene")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.TRIP_TYPE)
                .operator(Operator.EQUAL)
                .thresholdText("ADVENTURE")
                .suggestedItem("Trekking Shoes")
                .category("Footwear")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.TRIP_TYPE)
                .operator(Operator.EQUAL)
                .thresholdText("ADVENTURE")
                .suggestedItem("Hiking Backpack")
                .category("Gear")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.TRIP_TYPE)
                .operator(Operator.EQUAL)
                .thresholdText("ADVENTURE")
                .suggestedItem("Water Bottle")
                .category("Gear")
                .build(),

            // ---- Trip type – LEISURE ----
            PackingRule.builder()
                .conditionType(ConditionType.TRIP_TYPE)
                .operator(Operator.EQUAL)
                .thresholdText("LEISURE")
                .suggestedItem("Camera")
                .category("Electronics")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.TRIP_TYPE)
                .operator(Operator.EQUAL)
                .thresholdText("LEISURE")
                .suggestedItem("Travel Guidebook")
                .category("Entertainment")
                .build(),

            // ---- Trip type – BUSINESS ----
            PackingRule.builder()
                .conditionType(ConditionType.TRIP_TYPE)
                .operator(Operator.EQUAL)
                .thresholdText("BUSINESS")
                .suggestedItem("Laptop")
                .category("Electronics")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.TRIP_TYPE)
                .operator(Operator.EQUAL)
                .thresholdText("BUSINESS")
                .suggestedItem("Business Cards")
                .category("Documents")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.TRIP_TYPE)
                .operator(Operator.EQUAL)
                .thresholdText("BUSINESS")
                .suggestedItem("Formal Attire")
                .category("Clothing")
                .build(),

            // ---- Duration ----
            PackingRule.builder()
                .conditionType(ConditionType.DURATION)
                .operator(Operator.GREATER_THAN_OR_EQUAL)
                .thresholdValue(5.0)
                .suggestedItem("Extra Clothes")
                .category("Clothing")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.DURATION)
                .operator(Operator.GREATER_THAN_OR_EQUAL)
                .thresholdValue(7.0)
                .suggestedItem("Laundry Bag")
                .category("Accessories")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.DURATION)
                .operator(Operator.GREATER_THAN_OR_EQUAL)
                .thresholdValue(3.0)
                .suggestedItem("Travel-size Toiletries")
                .category("Health & Hygiene")
                .build(),

            // ---- Always pack (low threshold) ----
            PackingRule.builder()
                .conditionType(ConditionType.DURATION)
                .operator(Operator.GREATER_THAN_OR_EQUAL)
                .thresholdValue(1.0)
                .suggestedItem("Passport / ID")
                .category("Documents")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.DURATION)
                .operator(Operator.GREATER_THAN_OR_EQUAL)
                .thresholdValue(1.0)
                .suggestedItem("Phone Charger")
                .category("Electronics")
                .build(),

            PackingRule.builder()
                .conditionType(ConditionType.DURATION)
                .operator(Operator.GREATER_THAN_OR_EQUAL)
                .thresholdValue(1.0)
                .suggestedItem("Medications")
                .category("Health & Hygiene")
                .build()
        );

        packingRuleRepository.saveAll(defaultRules);
        log.info("Seeded {} default packing rules.", defaultRules.size());
    }
}
