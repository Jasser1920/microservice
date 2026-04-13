package rta.msevent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String type; // WEDDING, CONFERENCE, PARTY, SEMINAR, etc.
    
    @Column(nullable = false)
    private LocalDateTime startDateTime;
    
    @Column(nullable = false)
    private LocalDateTime endDateTime;
    
    private String venue; // Hall name or room number
    
    private Integer expectedAttendees;
    
    private Long organizerId; // User who organized the event
    
    @Column(nullable = false)
    private String status; // PLANNED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    
    private BigDecimal totalCost;
    
    @Column(length = 2000)
    private String description;
    
    private String services; // JSON or comma-separated: Catering, AV Equipment, Decoration, etc.
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
