package com.travelplanner.email.service.impl;

import com.travelplanner.activity.entity.Activity;
import com.travelplanner.activity.repository.ActivityRepository;
import com.travelplanner.auth.entity.User;
import com.travelplanner.email.entity.EmailLog;
import com.travelplanner.email.repository.EmailLogRepository;
import com.travelplanner.email.service.EmailService;
import com.travelplanner.packing.dto.PackingProgressResponse;
import com.travelplanner.packing.service.PackingService;
import com.travelplanner.trip.entity.Day;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.weather.dto.WeatherResponse;
import com.travelplanner.weather.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailLogRepository emailLogRepository;
    private final PackingService packingService;
    private final WeatherService weatherService;
    private final ActivityRepository activityRepository;

    @Value("${spring.mail.username:noreply@travelwise.com}")
    private String fromEmail;

    @Override
    @Transactional
    public void sendWelcomeEmail(User user) {
        String subject = "Welcome to TravelWise";
        String body = "Hello " + user.getName() + ",\n\n" +
                "Welcome to TravelWise.\n" +
                "Start planning amazing trips.\n\n" +
                "Best,\nThe TravelWise Team";

        sendEmail(user.getEmail(), subject, body, "WELCOME", null);
    }

    @Override
    @Transactional
    public void sendTripConfirmationEmail(Trip trip) {
        User user = trip.getUser();
        String subject = "Trip Confirmed: " + trip.getDestinationCity();
        
        long duration = java.time.temporal.ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
        
        String body = "Hello " + user.getName() + ",\n\n" +
                "Your trip has been successfully created!\n\n" +
                "Destination: " + trip.getDestinationCity() + ", " + trip.getDestinationCountry() + "\n" +
                "Dates: " + trip.getStartDate() + " to " + trip.getEndDate() + "\n" +
                "Trip Type: " + trip.getTripType() + "\n" +
                "Trip Duration: " + duration + " days\n\n" +
                "Happy planning,\nThe TravelWise Team";

        sendEmail(user.getEmail(), subject, body, "TRIP_CONFIRMATION", trip);
    }

    @Override
    @Transactional
    public void sendReminderEmail(Trip trip) {
        User user = trip.getUser();
        String subject = "Reminder: Your trip to " + trip.getDestinationCity() + " is in 3 days!";
        
        PackingProgressResponse packingProgress = packingService.getProgress(trip.getId(), user.getEmail());
        List<WeatherResponse> weatherList = weatherService.getWeatherForTrip(trip.getId(), user.getEmail());
        
        StringBuilder weatherSummary = new StringBuilder();
        if (weatherList != null && !weatherList.isEmpty()) {
            WeatherResponse w = weatherList.get(0); // Take first day's weather as summary
            weatherSummary.append("Expect ").append(w.getDescription())
                          .append(" with temperatures around ").append(w.getAvgTemp()).append("°C.");
        } else {
            weatherSummary.append("Weather data is currently unavailable.");
        }

        String body = "Hello " + user.getName() + ",\n\n" +
                "Get ready! Your trip is starting in just 3 days.\n\n" +
                "Destination: " + trip.getDestinationCity() + "\n" +
                "Weather Summary: " + weatherSummary.toString() + "\n" +
                "Packing Progress: " + packingProgress.getSummary() + " (" + packingProgress.getPercentage() + "%)\n\n" +
                "Safe travels,\nThe TravelWise Team";

        sendEmail(user.getEmail(), subject, body, "TRIP_REMINDER", trip);
    }

    @Override
    @Transactional
    public void sendTodayItineraryEmail(Trip trip) {
        User user = trip.getUser();
        String subject = "Your Itinerary for Today: " + trip.getDestinationCity();
        
        LocalDate today = LocalDate.now();
        Day currentDay = trip.getDays().stream()
                .filter(d -> d.getTripDate().equals(today))
                .findFirst()
                .orElse(null);
                
        List<WeatherResponse> weatherList = weatherService.getWeatherForTrip(trip.getId(), user.getEmail());
        WeatherResponse todayWeather = null;
        if (weatherList != null) {
            todayWeather = weatherList.stream()
                    .filter(w -> w.getWeatherDate().equals(today))
                    .findFirst()
                    .orElse(null);
        }

        StringBuilder body = new StringBuilder();
        body.append("Hello ").append(user.getName()).append(",\n\n");
        body.append("Here is your itinerary for today:\n\n");
        
        if (todayWeather != null) {
            body.append("Today's Weather: ").append(todayWeather.getDescription())
                .append(", Avg Temp: ").append(todayWeather.getAvgTemp()).append("°C\n\n");
        }
        
        if (currentDay != null) {
            List<Activity> activities = activityRepository.findByDayOrderBySortOrderAsc(currentDay);
            if (!activities.isEmpty()) {
                body.append("Activities:\n");
                for (Activity act : activities) {
                    body.append("- ").append(act.getStartTime()).append(" - ").append(act.getTitle())
                        .append(" at ").append(act.getLocation()).append("\n");
                }
            } else {
                body.append("No activities scheduled for today. Have a relaxing day!\n");
            }
        }
        
        body.append("\nEnjoy your trip,\nThe TravelWise Team");

        sendEmail(user.getEmail(), subject, body.toString(), "TODAY_ITINERARY", trip);
    }

    private void sendEmail(String to, String subject, String text, String type, Trip trip) {
        EmailLog emailLog = EmailLog.builder()
                .recipient(to)
                .subject(subject)
                .emailType(type)
                .trip(trip)
                .build();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            
            emailLog.setStatus("SUCCESS");
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            emailLog.setStatus("FAILED");
            emailLog.setErrorMessage(e.getMessage() != null && e.getMessage().length() > 1000 
                    ? e.getMessage().substring(0, 999) 
                    : e.getMessage());
        } finally {
            emailLogRepository.save(emailLog);
        }
    }
}
