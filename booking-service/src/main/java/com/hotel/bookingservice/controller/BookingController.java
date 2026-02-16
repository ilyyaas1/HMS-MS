package com.hotel.bookingservice.controller;

import com.hotel.bookingservice.model.Booking;
import com.hotel.bookingservice.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable String userId) {
        return bookingService.getBookingsByUserId(userId);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Booking updatedBooking = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.ok(updatedBooking);
        } catch (RuntimeException e) {
            String message = e.getMessage();
            if (message.contains("Booking not found")) {
                return ResponseEntity.status(404).body(new java.util.HashMap<String, String>() {
                    {
                        put("message", message);
                        put("error", "Booking not found");
                    }
                });
            } else if (message.contains("Invalid booking status")) {
                return ResponseEntity.badRequest().body(new java.util.HashMap<String, String>() {
                    {
                        put("message", message);
                        put("error", "Invalid Status");
                    }
                });
            } else {
                // Room service error or other logic error
                return ResponseEntity.status(500).body(new java.util.HashMap<String, String>() {
                    {
                        put("message", message);
                        put("error", "Internal processing error");
                    }
                });
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new java.util.HashMap<String, String>() {
                {
                    put("message", "Internal server error");
                    put("error", e.getMessage());
                }
            });
        }
    }

    @DeleteMapping("/{id}")
    public void cancelBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
    }
}
