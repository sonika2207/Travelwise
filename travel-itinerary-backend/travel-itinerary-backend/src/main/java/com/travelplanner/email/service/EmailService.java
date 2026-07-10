package com.travelplanner.email.service;

import com.travelplanner.auth.entity.User;
import com.travelplanner.trip.entity.Trip;

public interface EmailService {

    // ── Existing ─────────────────────────────────────────────────────────────
    void sendWelcomeEmail(User user);

    void sendTripConfirmationEmail(Trip trip);

    void sendReminderEmail(Trip trip, int daysUntil);

    void sendTodayItineraryEmail(Trip trip);

    void sendSupportMessage(User user, String message);

    // ── New ───────────────────────────────────────────────────────────────────

    /** Sent when the user updates a trip's destination or travel dates. */
    void sendTripUpdatedEmail(Trip trip);

    /** Sent when significant weather (storm, heavy rain) is detected for an upcoming trip. */
    void sendWeatherAlertEmail(Trip trip, String weatherCondition);

    /** Sent before departure when there are still unpacked items on the packing list. */
    void sendPackingReminderEmail(Trip trip, int unpackedCount);

    /**
     * Sent when total spending crosses a budget threshold (e.g. 80% or 100%).
     *
     * @param percentUsed the percentage of budget spent (e.g. 80 or 100)
     */
    void sendBudgetAlertEmail(Trip trip, int percentUsed);

    /** Sent the day after a trip ends as a thank-you / completion summary. */
    void sendTripCompletionEmail(Trip trip);
}
