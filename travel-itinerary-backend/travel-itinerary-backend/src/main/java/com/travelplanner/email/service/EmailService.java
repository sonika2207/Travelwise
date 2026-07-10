package com.travelplanner.email.service;

import com.travelplanner.auth.entity.User;
import com.travelplanner.trip.entity.Trip;

public interface EmailService {

    void sendWelcomeEmail(User user);

    void sendTripConfirmationEmail(Trip trip);

    void sendReminderEmail(Trip trip);

    void sendTodayItineraryEmail(Trip trip);
}
