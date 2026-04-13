package rta.msbooking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rta.msbooking.dto.RoomDto;
import rta.msbooking.entity.Booking;
import rta.msbooking.repository.BookingRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final RoomFeignService roomFeignService;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    public Booking createBooking(Booking booking) {
        if (!isRoomStatusAvailable(booking.getRoomId())) {
            throw new RuntimeException("Room is not available");
        }
        // Check room availability
        if (!isRoomAvailable(booking.getRoomId(), booking.getCheckInDate(), booking.getCheckOutDate())) {
            throw new RuntimeException("Room is not available for the selected dates");
        }
        booking.setStatus("PENDING");
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, Booking bookingDetails) {
        Booking booking = getBookingById(id);
        booking.setCheckInDate(bookingDetails.getCheckInDate());
        booking.setCheckOutDate(bookingDetails.getCheckOutDate());
        booking.setNumberOfGuests(bookingDetails.getNumberOfGuests());
        booking.setSpecialRequests(bookingDetails.getSpecialRequests());
        booking.setStatus(bookingDetails.getStatus());
        booking.setTotalPrice(bookingDetails.getTotalPrice());
        return bookingRepository.save(booking);
    }

    public void cancelBooking(Long id) {
        Booking booking = getBookingById(id);
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(booking);
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getBookingsByRoomId(Long roomId) {
        return bookingRepository.findByRoomId(roomId);
    }

    public Booking confirmBooking(Long id) {
        Booking booking = getBookingById(id);
        booking.setStatus("CONFIRMED");
        return bookingRepository.save(booking);
    }

    public Booking getBookingByConfirmationCode(String code) {
        return bookingRepository.findByConfirmationCode(code)
                .orElseThrow(() -> new RuntimeException("Booking not found with confirmation code: " + code));
    }

    public boolean isRoomAvailable(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        List<Booking> conflictingBookings = bookingRepository
                .findByRoomIdAndCheckInDateLessThanEqualAndCheckOutDateGreaterThanEqual(
                        roomId, checkOut, checkIn);
        return conflictingBookings.stream()
                .noneMatch(b -> "CONFIRMED".equals(b.getStatus()) || "PENDING".equals(b.getStatus()));
    }

    private boolean isRoomStatusAvailable(Long roomId) {
        RoomDto room = roomFeignService.getRoomById(roomId);
        return room != null && room.getStatus() != null && "AVAILABLE".equalsIgnoreCase(room.getStatus());
    }
}
