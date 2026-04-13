package rta.msevent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rta.msevent.entity.Event;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerId(Long organizerId);
    List<Event> findByType(String type);
    List<Event> findByStatus(String status);
    List<Event> findByVenue(String venue);
    
    @Query("SELECT e FROM Event e WHERE e.startDateTime >= :start AND e.endDateTime <= :end")
    List<Event> findEventsBetweenDates(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT e FROM Event e WHERE e.venue = :venue AND e.startDateTime < :end AND e.endDateTime > :start AND e.status IN ('PLANNED', 'CONFIRMED')")
    List<Event> findConflictingEvents(String venue, LocalDateTime start, LocalDateTime end);
}
