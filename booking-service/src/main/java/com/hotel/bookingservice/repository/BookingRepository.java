package com.hotel.bookingservice.repository;

import com.hotel.bookingservice.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(String userId);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.roomId = :roomId AND b.status = 'CONFIRMED' AND "
            +
            "((b.checkInDate <= :checkOutDate) AND (b.checkOutDate >= :checkInDate))")
    List<Booking> findOverlappingBookings(@org.springframework.web.bind.annotation.RequestParam("roomId") Long roomId,
            @org.springframework.web.bind.annotation.RequestParam("checkInDate") java.time.LocalDate checkInDate,
            @org.springframework.web.bind.annotation.RequestParam("checkOutDate") java.time.LocalDate checkOutDate);
}
