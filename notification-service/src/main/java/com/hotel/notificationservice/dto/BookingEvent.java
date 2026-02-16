package com.hotel.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingEvent implements Serializable {
    private Long bookingId;
    private String userId;
    private Long roomId;
    private String status;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
}
