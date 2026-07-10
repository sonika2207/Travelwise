package com.travelplanner.packing.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "packing_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_type", nullable = false)
    private ConditionType conditionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Operator operator;

    /**
     * Numeric threshold for numeric conditions (e.g. 15, 40, 5).
     * For TRIP_TYPE rules this is null; use thresholdText instead.
     */
    @Column(name = "threshold_value")
    private Double thresholdValue;

    /**
     * String threshold for TRIP_TYPE equality checks (e.g. "ADVENTURE", "LEISURE").
     */
    @Column(name = "threshold_text")
    private String thresholdText;

    @Column(name = "suggested_item", nullable = false)
    private String suggestedItem;

    @Column(nullable = false)
    private String category;
}
