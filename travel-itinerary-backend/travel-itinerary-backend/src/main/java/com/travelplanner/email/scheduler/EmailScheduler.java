package com.travelplanner.email.scheduler;

import com.travelplanner.email.service.EmailService;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailScheduler {

    private final TripRepository tripRepository;
    private final EmailService emailService;

    // Runs every day at 08:00 AM server time
    @Scheduled(cron = "0 0 8 * * *")
    public void scheduleDailyEmails() {
        log.info("Starting daily email scheduler...");
        
        LocalDate today = LocalDate.now();
        LocalDate threeDaysFromNow = today.plusDays(3);

        // Send reminders for trips starting in exactly 3 days
        List<Trip> upcomingTrips = tripRepository.findByStartDate(threeDaysFromNow);
        for (Trip trip : upcomingTrips) {
            try {
                emailService.sendReminderEmail(trip);
                log.info("Sent reminder email for trip {}", trip.getId());
            } catch (Exception e) {
                log.error("Error sending reminder email for trip {}", trip.getId(), e);
            }
        }

        // Send today's itinerary for trips starting today
        // (Assuming "today == trip start date" from the prompt. Though ideally it should be any day of the trip, 
        // the prompt says: "If today == trip start date Send Today's Itinerary Email.")
        List<Trip> startingTodayTrips = tripRepository.findByStartDate(today);
        for (Trip trip : startingTodayTrips) {
            try {
                emailService.sendTodayItineraryEmail(trip);
                log.info("Sent today's itinerary email for trip {}", trip.getId());
            } catch (Exception e) {
                log.error("Error sending today's itinerary email for trip {}", trip.getId(), e);
            }
        }
        
        log.info("Daily email scheduler finished.");
    }
}
