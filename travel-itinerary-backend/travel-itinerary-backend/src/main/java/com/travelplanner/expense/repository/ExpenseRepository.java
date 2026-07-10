package com.travelplanner.expense.repository;

import com.travelplanner.expense.entity.Expense;
import com.travelplanner.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByTrip(Trip trip);
    List<Expense> findByTripOrderByExpenseDate(Trip trip);
}
