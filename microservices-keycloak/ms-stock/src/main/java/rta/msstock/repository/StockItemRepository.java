package rta.msstock.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rta.msstock.entity.StockItem;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, Long> {
    Optional<StockItem> findByItemCode(String itemCode);
    List<StockItem> findByCategory(String category);
    
    @Query("SELECT s FROM StockItem s WHERE s.quantity <= s.minQuantity")
    List<StockItem> findLowStockItems();
    
    List<StockItem> findBySupplier(String supplier);
}
