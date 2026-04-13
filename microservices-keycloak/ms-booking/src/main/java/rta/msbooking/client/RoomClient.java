package rta.msbooking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import rta.msbooking.config.FeignConfig;
import rta.msbooking.dto.RoomDto;

import java.util.List;

@FeignClient(name = "ms-room", configuration = FeignConfig.class)
public interface RoomClient {

    @GetMapping("/rooms/available")
    List<RoomDto> getAvailableRooms();

    @GetMapping("/rooms/{id}")
    RoomDto getRoomById(@PathVariable("id") Long id);
}
