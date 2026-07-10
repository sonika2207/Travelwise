package com.travelplanner.email.service.impl;

import com.travelplanner.activity.entity.Activity;
import com.travelplanner.activity.repository.ActivityRepository;
import com.travelplanner.auth.entity.User;
import com.travelplanner.email.entity.EmailLog;
import com.travelplanner.email.repository.EmailLogRepository;
import com.travelplanner.email.service.EmailService;
import com.travelplanner.expense.entity.Expense;
import com.travelplanner.packing.dto.PackingProgressResponse;
import com.travelplanner.packing.service.PackingService;
import com.travelplanner.trip.entity.Day;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.weather.dto.WeatherResponse;
import com.travelplanner.weather.service.WeatherService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
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

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Welcome Email
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void sendWelcomeEmail(User user) {
        String subject = "Welcome to TravelWise! \uD83C\uDF0D";

        String content = row("greeting", "Hello <strong>" + user.getName() + "</strong>,") +
                row("text", "Welcome to <strong>TravelWise</strong>! Your account has been successfully created.") +
                row("text", "We&rsquo;re excited to help you plan smarter, travel easier, and stay organized throughout your journey.") +
                sectionHeader("Your account is ready!") +
                featureList(new String[]{
                        "\u2708\uFE0F Create and manage trips",
                        "\uD83D\uDCC5 Build personalized itineraries",
                        "\uD83C\uDF26\uFE0F Get live weather updates",
                        "\uD83C\uDF92 Receive smart packing suggestions",
                        "\uD83D\uDCB0 Track your travel budget",
                        "\uD83D\uDCE7 Receive important travel notifications"
                }) +
                row("text", "Thank you for choosing TravelWise.") +
                row("cta", "<strong>Happy Travels! \uD83C\uDF1F</strong>");

        sendHtml(user.getEmail(), subject, wrapTemplate(subject, content), "WELCOME", null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Trip Confirmation
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void sendTripConfirmationEmail(Trip trip) {
        User user = trip.getUser();
        String subject = "Your Trip Has Been Created Successfully! \u2708\uFE0F";
        long duration = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;

        String content = row("greeting", "Hello <strong>" + user.getName() + "</strong>,") +
                row("text", "Your trip has been successfully created.") +
                sectionHeader("Trip Summary") +
                tripDetailTable(trip, duration) +
                row("text", "We&rsquo;ll automatically send reminders, weather updates, packing suggestions, and itinerary notifications before your journey.") +
                row("cta", "Have an amazing trip! \u2708\uFE0F");

        sendHtml(user.getEmail(), subject, wrapTemplate(subject, content), "TRIP_CONFIRMATION", trip);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Trip Updated
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void sendTripUpdatedEmail(Trip trip) {
        User user = trip.getUser();
        String subject = "Trip Updated Successfully \u270F\uFE0F";
        long duration = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;

        String content = row("greeting", "Hello <strong>" + user.getName() + "</strong>,") +
                row("text", "Your trip information has been updated successfully.") +
                sectionHeader("Updated Trip Details") +
                tripDetailTable(trip, duration) +
                alertBox("If you didn&rsquo;t make these changes, please contact support immediately.", "#FFF5F5", "#E53E3E") +
                row("text", "Thank you,");

        sendHtml(user.getEmail(), subject, wrapTemplate(subject, content), "TRIP_UPDATED", trip);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Trip Reminder (1 or 2 days before)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void sendReminderEmail(Trip trip, int daysUntil) {
        User user = trip.getUser();
        String subject = "Your Trip Starts Soon! \u2708\uFE0F";

        PackingProgressResponse packing = packingService.getProgress(trip.getId(), user.getEmail());
        List<WeatherResponse> weatherList = weatherService.getWeatherForTrip(trip.getId(), user.getEmail());

        String weatherDesc = "Unavailable";
        String tempStr = "—";
        if (weatherList != null && !weatherList.isEmpty()) {
            WeatherResponse w = weatherList.get(0);
            weatherDesc = capitalize(w.getDescription());
            tempStr = w.getAvgTemp() != null ? w.getAvgTemp() + "°C" : "—";
        }

        String content = row("greeting", "Hello <strong>" + user.getName() + "</strong>,") +
                row("text", "Your trip to <strong>" + trip.getDestinationCity() + "</strong> begins in <strong>"
                        + daysUntil + " day" + (daysUntil > 1 ? "s" : "") + "</strong>.") +
                sectionHeader("Trip Information") +
                detailRow("\uD83D\uDCCD Destination", trip.getDestinationCity() + ", " + trip.getDestinationCountry()) +
                detailRow("\uD83D\uDCC5 Travel Dates", fmt(trip.getStartDate()) + " \u2192 " + fmt(trip.getEndDate())) +
                detailRow("\uD83C\uDF26\uFE0F Weather", weatherDesc) +
                detailRow("\uD83C\uDF21\uFE0F Temperature", tempStr) +
                detailRow("\uD83C\uDF92 Packing Progress", packing.getCheckedItems() + " / " + packing.getTotalItems() + " items packed") +
                row("text", "We recommend reviewing your itinerary and completing your packing before departure.") +
                row("cta", "Safe travels! \uD83C\uDF1F");

        sendHtml(user.getEmail(), subject, wrapTemplate(subject, content), "TRIP_REMINDER_" + daysUntil + "D", trip);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Packing Reminder
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void sendPackingReminderEmail(Trip trip, int unpackedCount) {
        User user = trip.getUser();
        long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), trip.getStartDate());
        String subject = "Packing Reminder \uD83C\uDF92";

        PackingProgressResponse packing = packingService.getProgress(trip.getId(), user.getEmail());

        String content = row("greeting", "Hello <strong>" + user.getName() + "</strong>,") +
                row("text", "Your trip is approaching, and your packing list isn&rsquo;t complete yet.") +
                sectionHeader("Packing Status") +
                detailRow("\u2705 Packed", packing.getCheckedItems() + " items") +
                detailRow("\uD83D\uDCE6 Remaining", unpackedCount + " items") +
                sectionHeader("Recommended Items") +
                featureList(new String[]{
                        "\u2602\uFE0F Umbrella",
                        "\uD83E\uDDF4 Sunscreen",
                        "\uD83D\uDE0E Sunglasses",
                        "\uD83E\uDDE2 Hat",
                        "\uD83D\uDCA7 Water Bottle",
                        "\uD83E\uDDE5 Light Jacket"
                }) +
                row("text", "Complete your packing checklist before your departure.") +
                row("cta", "Happy Packing! \uD83C\uDF92");

        sendHtml(user.getEmail(), subject, wrapTemplate(subject, content), "PACKING_REMINDER", trip);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Weather Alert
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void sendWeatherAlertEmail(Trip trip, String weatherCondition) {
        User user = trip.getUser();
        String subject = "Weather Alert for Your Upcoming Trip \u26C8\uFE0F";

        List<WeatherResponse> weatherList = weatherService.getWeatherForTrip(trip.getId(), user.getEmail());
        String tempStr = "—";
        String rainStr = "—";
        if (weatherList != null && !weatherList.isEmpty()) {
            WeatherResponse w = weatherList.get(0);
            tempStr = w.getAvgTemp() != null ? w.getAvgTemp() + "°C" : "—";
            rainStr = w.getRainChance() != null ? (int)(w.getRainChance() * 100) + "%" : "—";
        }

        String content = row("greeting", "Hello <strong>" + user.getName() + "</strong>,") +
                row("text", "Our weather service has detected important weather conditions for your upcoming trip.") +
                sectionHeader("Forecast") +
                detailRow("\uD83D\uDCCD Destination", trip.getDestinationCity() + ", " + trip.getDestinationCountry()) +
                detailRow("\uD83C\uDF26\uFE0F Condition", capitalize(weatherCondition)) +
                detailRow("\uD83C\uDF21\uFE0F Temperature", tempStr) +
                detailRow("\uD83C\uDF27\uFE0F Rain Probability", rainStr) +
                sectionHeader("Recommended Items") +
                featureList(new String[]{
                        "\u2602\uFE0F Umbrella",
                        "\uD83E\uDDE5 Waterproof Jacket",
                        "\uD83D\uDC5F Waterproof Shoes"
                }) +
                alertBox("Stay prepared and have a safe journey.", "#FFF9F0", "#D97706") +
                row("text", "");

        sendHtml(user.getEmail(), subject, wrapTemplate(subject, content), "WEATHER_ALERT", trip);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Itinerary Reminder (day before)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void sendTodayItineraryEmail(Trip trip) {
        User user = trip.getUser();
        String subject = "Tomorrow&rsquo;s Travel Plan \uD83D\uDCC5";

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        Day tomorrowDay = trip.getDays().stream()
                .filter(d -> d.getTripDate().equals(tomorrow))
                .findFirst().orElse(null);

        List<WeatherResponse> weatherList = weatherService.getWeatherForTrip(trip.getId(), user.getEmail());
        WeatherResponse tomorrowWeather = null;
        if (weatherList != null) {
            tomorrowWeather = weatherList.stream()
                    .filter(w -> w.getWeatherDate().equals(tomorrow))
                    .findFirst().orElse(null);
        }

        StringBuilder activitiesHtml = new StringBuilder();
        if (tomorrowDay != null) {
            List<Activity> activities = activityRepository.findByDayOrderBySortOrderAsc(tomorrowDay);
            if (!activities.isEmpty()) {
                activitiesHtml.append(sectionHeader("Tomorrow's Schedule"));
                for (Activity act : activities) {
                    String time = act.getStartTime() != null ? act.getStartTime().toString() : "—";
                    String loc = act.getLocation() != null && !act.getLocation().isBlank()
                            ? " @ " + act.getLocation() : "";
                    activitiesHtml.append(detailRow("\uD83D\uDD50 " + time, act.getTitle() + loc));
                }
            } else {
                activitiesHtml.append(row("text", "No activities scheduled yet. Add some to your itinerary!"));
            }
        }

        String weatherLine = tomorrowWeather != null
                ? detailRow("\uD83C\uDF26\uFE0F Weather", capitalize(tomorrowWeather.getDescription())
                        + ", " + tomorrowWeather.getAvgTemp() + "°C")
                : "";

        String content = row("greeting", "Hello <strong>" + user.getName() + "</strong>,") +
                row("text", "Your journey starts tomorrow.") +
                activitiesHtml.toString() +
                sectionHeader("Destination") +
                detailRow("\uD83D\uDCCD Destination", trip.getDestinationCity() + ", " + trip.getDestinationCountry()) +
                weatherLine +
                row("cta", "Have a wonderful journey! \u2708\uFE0F");

        sendHtml(user.getEmail(), subject, wrapTemplate("Tomorrow's Travel Plan \uD83D\uDCC5", content), "TODAY_ITINERARY", trip);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8 & 9. Budget Alert (80% and 100%)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void sendBudgetAlertEmail(Trip trip, int percentUsed) {
        User user = trip.getUser();
        boolean isOver = percentUsed >= 100;
        String subject = isOver
                ? "Budget Alert \u2013 Budget Limit Reached \uD83D\uDEA8"
                : "Budget Alert \u2013 " + percentUsed + "% Used \uD83D\uDCB0";

        BigDecimal totalSpent = trip.getExpenses() == null ? BigDecimal.ZERO :
                trip.getExpenses().stream()
                        .map(Expense::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        String budgetStr = trip.getBudget() != null
                ? (trip.getDestinationCurrency() != null ? trip.getDestinationCurrency() + " " : "")
                  + String.format("%.2f", trip.getBudget())
                : "—";
        String spentStr = (trip.getDestinationCurrency() != null ? trip.getDestinationCurrency() + " " : "")
                + totalSpent.setScale(2, RoundingMode.HALF_UP);
        BigDecimal remaining = trip.getBudget() != null
                ? BigDecimal.valueOf(trip.getBudget()).subtract(totalSpent) : BigDecimal.ZERO;
        String remainingStr = (trip.getDestinationCurrency() != null ? trip.getDestinationCurrency() + " " : "")
                + remaining.setScale(2, RoundingMode.HALF_UP);

        String alertMsg = isOver
                ? "You have reached or exceeded your planned travel budget."
                : "You&rsquo;ve used <strong>" + percentUsed + "%</strong> of your planned travel budget.";

        String content = row("greeting", "Hello <strong>" + user.getName() + "</strong>,") +
                row("text", alertMsg) +
                sectionHeader("Budget Summary") +
                detailRow("\uD83D\uDCB0 Total Budget", budgetStr) +
                detailRow("\uD83D\uDCB3 Spent", spentStr) +
                (isOver
                        ? detailRow("\uD83D\uDCC8 Status", "Budget Limit Reached")
                        : detailRow("\uD83D\uDCB5 Remaining", remainingStr)) +
                alertBox(isOver
                        ? "Please review your expenses before adding new ones."
                        : "We recommend monitoring your upcoming expenses.", "#FFF5F5", "#E53E3E") +
                row("text", isOver ? "" : "Enjoy your trip responsibly.");

        sendHtml(user.getEmail(), subject, wrapTemplate(subject, content), "BUDGET_ALERT_" + percentUsed, trip);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 10. Trip Completion
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void sendTripCompletionEmail(Trip trip) {
        User user = trip.getUser();
        String subject = "Thank You for Traveling with TravelWise! \uD83C\uDF0D";
        long duration = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;

        BigDecimal totalSpent = trip.getExpenses() == null ? BigDecimal.ZERO :
                trip.getExpenses().stream()
                        .map(Expense::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        String budgetStr = trip.getBudget() != null
                ? (trip.getDestinationCurrency() != null ? trip.getDestinationCurrency() + " " : "")
                  + String.format("%.2f", trip.getBudget())
                : "—";
        String spentStr = (trip.getDestinationCurrency() != null ? trip.getDestinationCurrency() + " " : "")
                + totalSpent.setScale(2, RoundingMode.HALF_UP);

        String content = row("greeting", "Hello <strong>" + user.getName() + "</strong>,") +
                row("text", "We hope you had an amazing trip to <strong>" + trip.getDestinationCity() + "</strong>.") +
                sectionHeader("Trip Summary") +
                detailRow("\uD83D\uDCCD Destination", trip.getDestinationCity() + ", " + trip.getDestinationCountry()) +
                detailRow("\uD83D\uDCC5 Duration", duration + " day" + (duration > 1 ? "s" : "")) +
                detailRow("\uD83D\uDCB0 Total Budget", budgetStr) +
                detailRow("\uD83D\uDCB3 Total Spent", spentStr) +
                row("text", "Thank you for choosing TravelWise.") +
                row("text", "We look forward to helping you plan your next adventure.") +
                row("cta", "See you again soon! \uD83C\uDF0D");

        sendHtml(user.getEmail(), subject, wrapTemplate(subject, content), "TRIP_COMPLETION", trip);
    }

    @Override
    public void sendSupportMessage(User user, String message) {
        String subject = "New Support Request from " + user.getName();
        String to = "travelwiseplanner@gmail.com"; // Support team email

        String content = row("greeting", "New Support Request \uD83D\uDCE9") +
                sectionHeader("User Details") +
                detailRow("\uD83D\uDC64 Name", user.getName()) +
                detailRow("\uD83D\uDCE7 Email", user.getEmail()) +
                sectionHeader("Message") +
                row("text", message.replace("\n", "<br/>"));

        sendHtml(to, subject, wrapTemplate(subject, content), "SUPPORT_REQUEST", null, user.getEmail());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HTML Template Builder
    // ─────────────────────────────────────────────────────────────────────────

    private String wrapTemplate(String title, String bodyContent) {
        return "<!DOCTYPE html>" +
            "<html lang='en'><head><meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
            "<title>" + title + "</title></head>" +
            "<body style='margin:0;padding:0;background:#F5F3EE;font-family:\"Segoe UI\",Arial,sans-serif;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='background:#F5F3EE;padding:32px 16px;'>" +
            "<tr><td align='center'>" +
            // Card
            "<table width='600' cellpadding='0' cellspacing='0' style='background:#FFFFFF;border-radius:16px;" +
            "box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;max-width:100%;'>" +
            // Header
            "<tr><td style='background:linear-gradient(135deg,#4A90D9 0%,#4ECDC4 60%,#6BCB77 100%);" +
            "padding:36px 40px;text-align:center;'>" +
            "<div style='font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;'>✈️ TravelWise</div>" +
            "<div style='font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;'>Your Smart Travel Companion</div>" +
            "</td></tr>" +
            // Body
            "<tr><td style='padding:36px 40px 28px;'>" + bodyContent + "</td></tr>" +
            // Footer
            "<tr><td style='background:#F5F3EE;padding:24px 40px;text-align:center;" +
            "border-top:1px solid #E8E2D9;'>" +
            "<div style='font-size:13px;font-weight:700;color:#4A90D9;'>— The TravelWise Team</div>" +
            "<div style='font-size:11px;color:#A0AEC0;margin-top:6px;'>You received this email because you have an account on TravelWise.</div>" +
            "</td></tr>" +
            "</table>" +
            "</td></tr></table>" +
            "</body></html>";
    }

    // ── HTML building helpers ─────────────────────────────────────────────────

    private String row(String type, String content) {
        return switch (type) {
            case "greeting" -> "<p style='font-size:20px;font-weight:700;color:#1A1A2E;margin:0 0 16px;'>" + content + "</p>";
            case "text"     -> content.isBlank() ? "" :
                               "<p style='font-size:14px;color:#4A5568;line-height:1.7;margin:0 0 14px;'>" + content + "</p>";
            case "cta"      -> "<p style='font-size:15px;font-weight:600;color:#4A90D9;margin:20px 0 0;text-align:center;'>" + content + "</p>";
            default         -> "<p>" + content + "</p>";
        };
    }

    private String sectionHeader(String title) {
        return "<div style='font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;" +
               "color:#A0AEC0;margin:24px 0 12px;border-bottom:1px solid #E8E2D9;padding-bottom:8px;'>" +
               title + "</div>";
    }

    private String detailRow(String label, String value) {
        return "<table width='100%' cellpadding='0' cellspacing='0' style='margin:6px 0;'>" +
               "<tr>" +
               "<td style='font-size:13px;color:#718096;width:45%;padding:8px 12px;background:#F9F7F4;" +
               "border-radius:8px 0 0 8px;vertical-align:top;'>" + label + "</td>" +
               "<td style='font-size:13px;color:#1A1A2E;font-weight:600;padding:8px 12px;background:#F9F7F4;" +
               "border-radius:0 8px 8px 0;border-left:1px solid #E8E2D9;vertical-align:top;'>" + value + "</td>" +
               "</tr></table>";
    }

    private String featureList(String[] items) {
        StringBuilder sb = new StringBuilder(
            "<ul style='margin:8px 0 16px 0;padding:0;list-style:none;'>");
        for (String item : items) {
            sb.append("<li style='font-size:13px;color:#4A5568;padding:6px 0;border-bottom:1px solid #F2EEE8;'>")
              .append(item).append("</li>");
        }
        sb.append("</ul>");
        return sb.toString();
    }

    private String alertBox(String message, String bgColor, String borderColor) {
        return "<div style='background:" + bgColor + ";border-left:4px solid " + borderColor + ";" +
               "border-radius:8px;padding:14px 16px;margin:20px 0;font-size:13px;color:#2D3748;line-height:1.6;'>" +
               message + "</div>";
    }

    private String tripDetailTable(Trip trip, long duration) {
        return detailRow("\uD83D\uDCCD Destination", trip.getDestinationCity() + ", " + trip.getDestinationCountry()) +
               detailRow("\uD83D\uDCC5 Travel Dates", fmt(trip.getStartDate()) + " \u2192 " + fmt(trip.getEndDate())) +
               detailRow("\uD83C\uDFF7\uFE0F Trip Type", trip.getTripType()) +
               detailRow("\u23F1\uFE0F Duration", duration + " day" + (duration > 1 ? "s" : "")) +
               (trip.getBudget() != null
                   ? detailRow("\uD83D\uDCB0 Budget",
                       (trip.getDestinationCurrency() != null ? trip.getDestinationCurrency() + " " : "")
                       + String.format("%.2f", trip.getBudget()))
                   : "");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Core send method
    // ─────────────────────────────────────────────────────────────────────────

    private void sendHtml(String to, String subject, String htmlBody, String type, Trip trip) {
        sendHtml(to, subject, htmlBody, type, trip, null);
    }

    private void sendHtml(String to, String subject, String htmlBody, String type, Trip trip, String replyTo) {
        EmailLog emailLog = EmailLog.builder()
                .recipient(to)
                .subject(subject)
                .emailType(type)
                .trip(trip)
                .build();

        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            if (replyTo != null) {
                helper.setReplyTo(replyTo);
            }
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(mime);
            emailLog.setStatus("SUCCESS");
            log.info("HTML email [{}] sent to {}", type, to);
        } catch (Exception e) {
            log.error("Failed to send email [{}] to {}: {}", type, to, e.getMessage());
            emailLog.setStatus("FAILED");
            emailLog.setErrorMessage(e.getMessage() != null && e.getMessage().length() > 1000
                    ? e.getMessage().substring(0, 999) : e.getMessage());
        } finally {
            emailLogRepository.save(emailLog);
        }
    }

    // ── Utilities ─────────────────────────────────────────────────────────────

    private String fmt(LocalDate date) {
        return date != null ? date.format(DATE_FMT) : "—";
    }

    private String capitalize(String s) {
        if (s == null || s.isBlank()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }
}
