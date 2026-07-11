package com.travelplanner.weather.entity;

import com.travelplanner.trip.entity.Trip;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weather_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class WeatherData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "weather_date", nullable = false)
    private LocalDate weatherDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    private DataType dataType;

    private Double avgTemp;
    private Double minTemp;
    private Double maxTemp;
    private Integer humidity;
    private Double rainChance;
    private String description;
    private String iconCode;

    @CreatedDate
    @Column(name = "fetched_at", nullable = false, updatable = false)
    private LocalDateTime fetchedAt;
}

