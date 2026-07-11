package com.travelplanner.trip.entity;

import com.travelplanner.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "trip_name")
    private String tripName;

    @Column(name = "destination_city", nullable = false)
    private String destinationCity;

    @Column(name = "destination_country", nullable = false)
    private String destinationCountry;

    @Column(name = "destination_currency")
    private String destinationCurrency;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "budget")
    private Double budget;

    @Column(name = "cover_photo_url")
    private String coverPhotoUrl;

    @Column(name = "photo_attribution")
    private String photoAttribution;

    @Column(name = "trip_type", nullable = false)
    private String tripType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Day> days;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.travelplanner.expense.entity.Expense> expenses;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.travelplanner.packing.entity.PackingItem> packingItems;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.travelplanner.weather.entity.WeatherData> weatherData;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.travelplanner.currency.entity.ExchangeRate> exchangeRates;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.travelplanner.email.entity.EmailLog> emailLogs;
}

