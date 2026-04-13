package rta.msstock.entity;

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
@Table(name = "stock_items")
public class StockItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String itemCode;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String category; // RESTAURANT, SPA, MINIBAR, CLEANING, LINEN, etc.
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false)
    private Integer minQuantity; // Alert threshold
    
    private String unit; // piece, liter, kg, etc.
    
    private BigDecimal unitPrice;
    
    private String supplier;
    
    private LocalDateTime lastRestocked;
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
    
    @Transient
    public boolean isLowStock() {
        return quantity <= minQuantity;
    }
}
