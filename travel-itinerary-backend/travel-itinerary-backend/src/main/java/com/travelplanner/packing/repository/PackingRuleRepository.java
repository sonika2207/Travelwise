package com.travelplanner.packing.repository;

import com.travelplanner.packing.entity.PackingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackingRuleRepository extends JpaRepository<PackingRule, Long> {
}
