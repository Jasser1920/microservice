package rta.msbooking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rta.msbooking.client.RoomClient;
import rta.msbooking.dto.RoomDto;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomFeignService {
    private final RoomClient roomClient;

    public List<RoomDto> getAvailableRooms() {
        return roomClient.getAvailableRooms();
    }

    public RoomDto getRoomById(Long id) {
        return roomClient.getRoomById(id);
    }
}
