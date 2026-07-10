package com.travelplanner.packing.entity;

import com.travelplanner.trip.entity.Trip;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "packing_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PackingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(nullable = false)
    private String category;

    /** Whether the traveller has packed this item. */
    @Builder.Default
    @Column(nullable = false)
    private boolean checked = false;

    /** True if this was added manually by the user (not from a rule). */
    @Builder.Default
    @Column(name = "custom_item", nullable = false)
    private boolean customItem = false;

    /**
     * The rule that generated this item. Null for custom items.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_rule_id")
    private PackingRule sourceRule;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
