package com.hotel.notificationservice.consumer;

import com.hotel.notificationservice.config.NotificationConfig;
import com.hotel.notificationservice.dto.BookingEvent;
import com.hotel.notificationservice.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);

    @Autowired
    private EmailService emailService;

    @RabbitListener(queues = NotificationConfig.QUEUE)
    public void consumeBookingEvent(BookingEvent event) {
        try {
            logger.info("📩 Received Booking Event: {}", event);
            logger.info("   User ID: {}, Room ID: {}, Status: {}",
                    event.getUserId(), event.getRoomId(), event.getStatus());
            logger.info("   Dates: {} to {}", event.getCheckInDate(), event.getCheckOutDate());

            String emailBody = String.format(
                    "Dear User %s,\n\nYour booking for Room %d is %s.\n\nCheck-in: %s\nCheck-out: %s\n\nThank you for choosing our hotel!",
                    event.getUserId(),
                    event.getRoomId(),
                    event.getStatus(),
                    event.getCheckInDate(),
                    event.getCheckOutDate());

            emailService.sendEmail("user@example.com", "Booking Confirmation", emailBody);
            logger.info("✅ Notification sent successfully for booking ID: {}", event.getBookingId());

        } catch (Exception e) {
            logger.error("❌ Error processing booking event: {}", event, e);
        }
    }
}
