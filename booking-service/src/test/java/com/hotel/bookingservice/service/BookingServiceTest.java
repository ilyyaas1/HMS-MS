package com.hotel.bookingservice.service;

import com.hotel.bookingservice.client.RoomServiceClient;
import com.hotel.bookingservice.dto.Room;
import com.hotel.bookingservice.model.Booking;
import com.hotel.bookingservice.model.BookingStatus;
import com.hotel.bookingservice.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private RoomServiceClient roomServiceClient;

    @InjectMocks
    private BookingService bookingService;

    private Booking booking;
    private Room room;

    @BeforeEach
    void setUp() {
        booking = new Booking();
        booking.setId(1L);
        booking.setRoomId(101L);
        booking.setUserId("user-123");
        booking.setCheckInDate(LocalDate.now().plusDays(1));
        booking.setCheckOutDate(LocalDate.now().plusDays(3));
        booking.setStatus(BookingStatus.PENDING);

        room = new Room();
        room.setId(101L);
        room.setAvailable(true);
        room.setPrice(new BigDecimal("100.00"));
    }

    @Test
    void createBooking_Success() {
        // Arrange
        when(roomServiceClient.getRoomById(101L)).thenReturn(room);
        when(bookingRepository.findOverlappingBookings(any(), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        // Act
        Booking createdBooking = bookingService.createBooking(booking);

        // Assert
        assertNotNull(createdBooking);
        assertEquals(BookingStatus.PENDING, createdBooking.getStatus());
        
        // Verify dependency calls
        verify(roomServiceClient).getRoomById(101L);
        // Should update room availability to false (reserved)
        verify(roomServiceClient).updateRoomAvailability(101L, false);
        verify(bookingRepository).save(any(Booking.class));
        verify(rabbitTemplate).convertAndSend(eq("booking-exchange"), eq("booking.created"), any(Object.class));
    }

    @Test
    void createBooking_RoomNotAvailable_ThrowsException() {
        // Arrange
        room.setAvailable(false);
        when(roomServiceClient.getRoomById(101L)).thenReturn(room);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(booking);
        });
        assertEquals("Room not available", exception.getMessage());

        // Verify no booking saved
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void updateBookingStatus_Cancel_Success() {
        // Arrange
        booking.setStatus(BookingStatus.CONFIRMED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        // Act
        bookingService.updateBookingStatus(1L, "CANCELLED");

        // Assert
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());

        // Verify room becomes available
        verify(roomServiceClient).updateRoomAvailability(101L, true);
    }

    @Test
    void updateBookingStatus_InvalidStatus_ThrowsException() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            bookingService.updateBookingStatus(1L, "INVALID_STATUS");
        });
        
        assertTrue(exception.getMessage().contains("Invalid booking status"));
    }
}
