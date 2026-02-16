package com.hotel.bookingservice.service;

import com.hotel.bookingservice.dto.BookingEvent;
import com.hotel.bookingservice.model.Booking;
import com.hotel.bookingservice.model.BookingStatus;
import com.hotel.bookingservice.repository.BookingRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.hotel.bookingservice.client.RoomServiceClient;

import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private RoomServiceClient roomServiceClient;

    public Booking createBooking(Booking booking) {
        // Validate room availability
        com.hotel.bookingservice.dto.Room room = roomServiceClient.getRoomById(booking.getRoomId());

        if (room == null || !room.isAvailable()) {
            throw new RuntimeException("Room not available");
        }

        // Validate dates
        if (booking.getCheckOutDate().isBefore(booking.getCheckInDate())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        // Check for overlapping bookings
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                booking.getRoomId(),
                booking.getCheckInDate(),
                booking.getCheckOutDate());

        if (!overlappingBookings.isEmpty()) {
            throw new RuntimeException("Room is already booked for the selected dates");
        }

        // Calculate total price
        long nights = java.time.temporal.ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        if (nights <= 0)
            nights = 1; // Minimum 1 night charge
        booking.setTotalPrice(room.getPrice().multiply(java.math.BigDecimal.valueOf(nights)));

        // Initialize status
        if (booking.getStatus() == null) {
            booking.setStatus(BookingStatus.PENDING);
        }

        // If the booking is PENDING or CONFIRMED, we reserve the room
        // This assumes PENDING means "in process of being booked" which should block
        // the room
        Booking savedBooking = bookingRepository.save(booking);

        // Update room availability
        try {
            System.out.println(
                    "BookingService: Updating room availability for room " + booking.getRoomId() + " to false");
            roomServiceClient.updateRoomAvailability(booking.getRoomId(), false);
            System.out.println("BookingService: Room availability updated successfully");
        } catch (Exception e) {
            System.err.println("BookingService: Failed to update room availability: " + e.getMessage());
            e.printStackTrace();
            // Don't fail the booking if room update fails, but log it criticaly
        }

        // Publish event
        BookingEvent event = new BookingEvent(
                savedBooking.getId(),
                savedBooking.getUserId(),
                savedBooking.getRoomId(),
                savedBooking.getStatus().name(),
                savedBooking.getCheckInDate(),
                savedBooking.getCheckOutDate());
        rabbitTemplate.convertAndSend("booking-exchange", "booking.created", event);

        return savedBooking;
    }

    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking updateBookingStatus(Long id, String statusStr) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        BookingStatus oldStatus = booking.getStatus();
        BookingStatus newStatus;
        try {
            newStatus = BookingStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid booking status: " + statusStr);
        }

        booking.setStatus(newStatus);
        Booking updatedBooking = bookingRepository.save(booking);

        // If booking is cancelled, make the room available again
        if (BookingStatus.CANCELLED == newStatus && BookingStatus.CANCELLED != oldStatus) {
            roomServiceClient.updateRoomAvailability(booking.getRoomId(), true);
        } else if ((BookingStatus.CONFIRMED == newStatus || BookingStatus.PENDING == newStatus)
                && (BookingStatus.CANCELLED == oldStatus)) {
            // If re-confirming or re-pending after cancellation, make the room unavailable
            roomServiceClient.updateRoomAvailability(booking.getRoomId(), false);
        }

        return updatedBooking;
    }

    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking != null) {
            // Make room available if deleting a non-cancelled booking
            if (BookingStatus.CANCELLED != booking.getStatus()) {
                roomServiceClient.updateRoomAvailability(booking.getRoomId(), true);
            }
            bookingRepository.deleteById(id);
        }
    }
}
