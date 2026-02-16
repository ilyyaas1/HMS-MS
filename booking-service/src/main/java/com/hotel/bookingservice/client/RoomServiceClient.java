package com.hotel.bookingservice.client;

import com.hotel.bookingservice.dto.Room;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "room-service")
public interface RoomServiceClient {

    @GetMapping("/rooms/{id}")
    Room getRoomById(@PathVariable("id") Long id);

    @org.springframework.web.bind.annotation.PutMapping("/rooms/{id}/availability")
    void updateRoomAvailability(@PathVariable("id") Long id,
            @org.springframework.web.bind.annotation.RequestParam("available") boolean available);
}
