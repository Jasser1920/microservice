package rta.msbooking.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RoomDto {
    private Long id;
    private String roomNumber;
    private String type;
    private Integer floor;
    private BigDecimal pricePerNight;
    private String status;
    private Integer capacity;
    private String amenities;
    private String description;
}
