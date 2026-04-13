package rta.msevent.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rta.msevent.entity.Event;
import rta.msevent.repository.EventRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    public Event createEvent(Event event) {
        // Check for venue conflicts
        if (event.getVenue() != null) {
            List<Event> conflicts = eventRepository.findConflictingEvents(
                    event.getVenue(),
                    event.getStartDateTime(),
                    event.getEndDateTime()
            );
            if (!conflicts.isEmpty()) {
                throw new RuntimeException("Venue is already booked for this time slot");
            }
        }
        event.setStatus("PLANNED");
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event eventDetails) {
        Event event = getEventById(id);
        event.setName(eventDetails.getName());
        event.setType(eventDetails.getType());
        event.setStartDateTime(eventDetails.getStartDateTime());
        event.setEndDateTime(eventDetails.getEndDateTime());
        event.setVenue(eventDetails.getVenue());
        event.setExpectedAttendees(eventDetails.getExpectedAttendees());
        event.setStatus(eventDetails.getStatus());
        event.setTotalCost(eventDetails.getTotalCost());
        event.setDescription(eventDetails.getDescription());
        event.setServices(eventDetails.getServices());
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        Event event = getEventById(id);
        eventRepository.delete(event);
    }

    public List<Event> getEventsByOrganizer(Long organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }

    public List<Event> getEventsByType(String type) {
        return eventRepository.findByType(type);
    }

    public List<Event> getEventsByStatus(String status) {
        return eventRepository.findByStatus(status);
    }

    public List<Event> getEventsBetweenDates(LocalDateTime start, LocalDateTime end) {
        return eventRepository.findEventsBetweenDates(start, end);
    }

    public Event confirmEvent(Long id) {
        Event event = getEventById(id);
        event.setStatus("CONFIRMED");
        return eventRepository.save(event);
    }

    public Event cancelEvent(Long id) {
        Event event = getEventById(id);
        event.setStatus("CANCELLED");
        return eventRepository.save(event);
    }

    public boolean isVenueAvailable(String venue, LocalDateTime start, LocalDateTime end) {
        List<Event> conflicts = eventRepository.findConflictingEvents(venue, start, end);
        return conflicts.isEmpty();
    }
}
