package com.travelplanner.email.scheduler;

import com.travelplanner.email.repository.EmailLogRepository;
import com.travelplanner.email.service.EmailService;
import com.travelplanner.packing.dto.PackingProgressResponse;
import com.travelplanner.packing.service.PackingService;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.trip.repository.TripRepository;
import com.travelplanner.weather.dto.WeatherResponse;
import com.travelplanner.weather.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailScheduler {

    private final TripRepository tripRepository;
    private final EmailService emailService;
    private final EmailLogRepository emailLogRepository;
    private final PackingService packingService;
    private final WeatherService weatherService;

    /**
     * Significant weather keywords that trigger a weather-alert email.
     */
    private static final Set<String> SEVERE_WEATHER_KEYWORDS = Set.of(
            "storm", "thunderstorm", "heavy rain", "tornado", "hurricane",
            "blizzard", "snow", "hail", "fog", "extreme"
    );

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Main daily scheduler â€” runs every day at 08:00 AM server time
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Scheduled(cron = "0 0 8 * * *")
    public void scheduleDailyEmails() {
        log.info("=== Daily email scheduler started ===");
        LocalDate today = LocalDate.now();

        sendTripReminders(today);
        sendItineraryReminders(today);
        sendPackingReminders(today);
        sendWeatherAlerts(today);
        sendTripCompletionEmails(today);

        log.info("=== Daily email scheduler finished ===");
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Job 1: Trip reminder â€” 2 days AND 1 day before departure
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private void sendTripReminders(LocalDate today) {
        for (int daysAhead : Arrays.asList(2, 1)) {
            LocalDate targetDate = today.plusDays(daysAhead);
            List<Trip> trips = tripRepository.findByStartDate(targetDate);

            for (Trip trip : trips) {
                String emailType = "TRIP_REMINDER_" + daysAhead + "D";
                if (alreadySentToday(trip, emailType)) {
                    log.debug("Skipping {} for trip {} â€” already sent today", emailType, trip.getId());
                    continue;
                }
                try {
                    emailService.sendReminderEmail(trip, daysAhead);
                    log.info("Sent {} for trip {} ({})", emailType, trip.getId(), trip.getDestinationCity());
                } catch (Exception e) {
                    log.error("Error sending {} for trip {}", emailType, trip.getId(), e);
                }
            }
        }
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Job 2: Itinerary reminder â€” sent the day BEFORE the trip starts
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private void sendItineraryReminders(LocalDate today) {
        // Send for trips starting tomorrow
        LocalDate tomorrow = today.plusDays(1);
        List<Trip> trips = tripRepository.findByStartDate(tomorrow);

        for (Trip trip : trips) {
            if (alreadySentToday(trip, "TODAY_ITINERARY")) {
                log.debug("Skipping itinerary email for trip {} â€” already sent today", trip.getId());
                continue;
            }
            try {
                emailService.sendTodayItineraryEmail(trip);
                log.info("Sent itinerary-preview email for trip {} ({})", trip.getId(), trip.getDestinationCity());
            } catch (Exception e) {
                log.error("Error sending itinerary email for trip {}", trip.getId(), e);
            }
        }
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Job 3: Packing reminder â€” sent 2 days before if items still unpacked
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private void sendPackingReminders(LocalDate today) {
        LocalDate targetDate = today.plusDays(2);
        List<Trip> trips = tripRepository.findByStartDate(targetDate);

        for (Trip trip : trips) {
            if (alreadySentToday(trip, "PACKING_REMINDER")) {
                continue;
            }
            try {
                PackingProgressResponse progress = packingService.getProgress(
                        trip.getId(), trip.getUser().getEmail());

                int unpacked = progress.getTotalItems() - progress.getCheckedItems();
                if (unpacked > 0) {
                    emailService.sendPackingReminderEmail(trip, unpacked);
                    log.info("Sent packing reminder for trip {} â€” {} items unpacked", trip.getId(), unpacked);
                } else {
                    log.debug("Skipping packing reminder for trip {} â€” fully packed", trip.getId());
                }
            } catch (Exception e) {
                log.error("Error sending packing reminder for trip {}", trip.getId(), e);
            }
        }
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Job 4: Weather alert â€” sent when severe weather detected for upcoming trips
    //        Checks trips starting within the next 3 days
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private void sendWeatherAlerts(LocalDate today) {
        for (int daysAhead = 1; daysAhead <= 3; daysAhead++) {
            List<Trip> trips = tripRepository.findByStartDate(today.plusDays(daysAhead));

            for (Trip trip : trips) {
                if (alreadySentToday(trip, "WEATHER_ALERT")) {
                    continue;
                }
                try {
                    List<WeatherResponse> weatherList = weatherService.getWeatherForTrip(
                            trip.getId(), trip.getUser().getEmail());

                    if (weatherList == null || weatherList.isEmpty()) continue;

                    String severeCondition = weatherList.stream()
                            .filter(w -> w.getDescription() != null)
                            .filter(w -> SEVERE_WEATHER_KEYWORDS.stream()
                                    .anyMatch(kw -> w.getDescription().toLowerCase().contains(kw)))
                            .map(WeatherResponse::getDescription)
                            .findFirst()
                            .orElse(null);

                    if (severeCondition != null) {
                        emailService.sendWeatherAlertEmail(trip, severeCondition);
                        log.info("Sent weather alert for trip {} â€” condition: {}", trip.getId(), severeCondition);
                    }
                } catch (Exception e) {
                    log.error("Error checking weather for trip {}", trip.getId(), e);
                }
            }
        }
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Job 5: Trip completion email â€” sent the day AFTER the trip ends
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private void sendTripCompletionEmails(LocalDate today) {
        // Find trips that ended yesterday
        LocalDate yesterday = today.minusDays(1);
        List<Trip> trips = tripRepository.findByEndDate(yesterday);

        for (Trip trip : trips) {
            if (alreadySentToday(trip, "TRIP_COMPLETION")) {
                continue;
            }
            try {
                emailService.sendTripCompletionEmail(trip);
                log.info("Sent completion email for trip {} ({})", trip.getId(), trip.getDestinationCity());
            } catch (Exception e) {
                log.error("Error sending completion email for trip {}", trip.getId(), e);
            }
        }
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Deduplication helper
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Returns true if a successful email of the given type was already sent
     * for this trip since midnight today â€” prevents duplicate sends on restarts.
     */
    private boolean alreadySentToday(Trip trip, String emailType) {
        LocalDateTime midnight = LocalDate.now().atStartOfDay();
        return emailLogRepository.existsSuccessfulEmailSince(trip, emailType, midnight);
    }
}
