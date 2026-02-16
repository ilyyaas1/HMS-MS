package com.hotel.bookingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    private Long id;
    private String roomNumber;
    private String type;
    private BigDecimal price;
    private boolean isAvailable;
}
