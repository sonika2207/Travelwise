package com.travelplanner.trip.service.impl;

import com.travelplanner.auth.entity.User;
import com.travelplanner.auth.repository.UserRepository;
import com.travelplanner.exception.ForbiddenException;
import com.travelplanner.exception.ResourceNotFoundException;
import com.travelplanner.trip.dto.TripRequest;
import com.travelplanner.trip.dto.TripResponse;
import com.travelplanner.trip.dto.TripSummaryResponse;
import com.travelplanner.trip.entity.Day;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.trip.repository.DayRepository;
import com.travelplanner.trip.repository.TripRepository;
import com.travelplanner.trip.service.TripService;
import com.travelplanner.email.service.EmailService;
import com.travelplanner.photo.service.PhotoService;
import com.travelplanner.currency.util.CurrencyResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final DayRepository dayRepository;
    private final UserRepository userRepository;
    private final PhotoService photoService;
    private final EmailService emailService;
    private final CurrencyResolver currencyResolver;

    @Override
    @Transactional
    public TripResponse createTrip(TripRequest request, String userEmail) {
        validateDates(request.getStartDate(), request.getEndDate());
        User user = getUserByEmail(userEmail);

        // Use the user-supplied currency if provided; otherwise resolve from country
        String resolvedCurrency = request.getDestinationCurrency();
        if (resolvedCurrency == null || resolvedCurrency.isBlank()) {
            resolvedCurrency = currencyResolver.resolveCurrency(request.getDestinationCountry(), "USD");
        }

        Trip trip = Trip.builder()
                .user(user)
                .tripName(request.getTripName())
                .destinationCity(request.getDestinationCity())
                .destinationCountry(request.getDestinationCountry())
                .destinationCurrency(resolvedCurrency)
                .description(request.getDescription())
                .budget(request.getBudget())
                .coverPhotoUrl(request.getCoverPhotoUrl())
                .tripType(request.getTripType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        trip = tripRepository.save(trip);
        createDaysForTrip(trip);
        
        // Auto-fetch photo
        photoService.fetchTripCoverPhotoInternal(trip.getId());
        // Reload trip to get the updated photo
        trip = tripRepository.findById(trip.getId()).orElse(trip);
        
        // Send confirmation email
        emailService.sendTripConfirmationEmail(trip);
        
        return mapToTripResponse(trip);
    }

    @Override
    public TripResponse getTripById(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
                
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not allowed to access this trip");
        }
        
        return mapToTripResponse(trip);
    }

    @Override
    public List<TripSummaryResponse> getAllTrips(String userEmail) {
        User user = getUserByEmail(userEmail);
        return tripRepository.findByUser(user).stream()
                .map(this::mapToTripSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TripResponse updateTrip(Long id, TripRequest request, String userEmail) {
        validateDates(request.getStartDate(), request.getEndDate());
        User user = getUserByEmail(userEmail);
        
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
                
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not allowed to edit this trip");
        }
        
        boolean datesChanged = !trip.getStartDate().equals(request.getStartDate()) || 
                               !trip.getEndDate().equals(request.getEndDate());

        String resolvedCurrency = request.getDestinationCurrency();
        if (resolvedCurrency == null || resolvedCurrency.isBlank()) {
            resolvedCurrency = currencyResolver.resolveCurrency(request.getDestinationCountry(), "USD");
        }

        trip.setTripName(request.getTripName());
        trip.setDestinationCity(request.getDestinationCity());
        trip.setDestinationCountry(request.getDestinationCountry());
        trip.setDestinationCurrency(resolvedCurrency);
        trip.setDescription(request.getDescription());
        trip.setBudget(request.getBudget());
        trip.setCoverPhotoUrl(request.getCoverPhotoUrl());
        trip.setTripType(request.getTripType());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());

        trip = tripRepository.save(trip);
        
        if (datesChanged) {
            // Clear in-place â€” orphanRemoval=true handles the DB deletes automatically.
            // Never call setDays() on a managed entity; it replaces the tracked collection
            // reference and Hibernate throws: "collection with orphan deletion no longer referenced".
            trip.getDays().clear();
            createDaysForTrip(trip);
        }

        // Notify user that their trip has been updated
        emailService.sendTripUpdatedEmail(trip);

        return mapToTripResponse(trip);
    }

    @Override
    @Transactional
    public void deleteTrip(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
                
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not allowed to delete this trip");
        }
        
        tripRepository.delete(trip);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
    }

    private void createDaysForTrip(Trip trip) {
        List<Day> newDays = new ArrayList<>();
        LocalDate currentDate = trip.getStartDate();
        int dayNumber = 1;

        while (!currentDate.isAfter(trip.getEndDate())) {
            Day day = Day.builder()
                    .trip(trip)
                    .dayNumber(dayNumber)
                    .tripDate(currentDate)
                    .build();
            newDays.add(day);

            dayNumber++;
            currentDate = currentDate.plusDays(1);
        }

        dayRepository.saveAll(newDays);

        // For new trips the collection may be null â€” initialise it.
        // For existing trips (update flow) the collection is already managed by Hibernate;
        // we must ADD to it, never replace the reference, to avoid the orphanRemoval error.
        if (trip.getDays() == null) {
            trip.setDays(new ArrayList<>(newDays));
        } else {
            trip.getDays().addAll(newDays);
        }
    }

    private long calculateTripDuration(LocalDate startDate, LocalDate endDate) {
        return ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    private String calculateTripStatus(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        if (today.isBefore(startDate)) {
            return "UPCOMING";
        } else if (today.isAfter(endDate)) {
            return "PAST";
        } else {
            return "ONGOING";
        }
    }

    private TripResponse mapToTripResponse(Trip trip) {
        return TripResponse.builder()
                .id(trip.getId())
                .tripName(trip.getTripName())
                .destinationCity(trip.getDestinationCity())
                .destinationCountry(trip.getDestinationCountry())
                .destinationCurrency(trip.getDestinationCurrency())
                .description(trip.getDescription())
                .budget(trip.getBudget())
                .coverPhotoUrl(trip.getCoverPhotoUrl())
                .photoAttribution(trip.getPhotoAttribution())
                .tripType(trip.getTripType())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .tripDuration(calculateTripDuration(trip.getStartDate(), trip.getEndDate()))
                .tripStatus(calculateTripStatus(trip.getStartDate(), trip.getEndDate()))
                .createdAt(trip.getCreatedAt())
                .build();
    }
    
    private TripSummaryResponse mapToTripSummaryResponse(Trip trip) {
        return TripSummaryResponse.builder()
                .id(trip.getId())
                .tripName(trip.getTripName())
                .destinationCity(trip.getDestinationCity())
                .destinationCountry(trip.getDestinationCountry())
                .destinationCurrency(trip.getDestinationCurrency())
                .coverPhotoUrl(trip.getCoverPhotoUrl())
                .photoAttribution(trip.getPhotoAttribution())
                .tripType(trip.getTripType())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .tripDuration(calculateTripDuration(trip.getStartDate(), trip.getEndDate()))
                .tripStatus(calculateTripStatus(trip.getStartDate(), trip.getEndDate()))
                .build();
    }
}
