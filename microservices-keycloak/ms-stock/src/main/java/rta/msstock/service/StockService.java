package rta.msstock.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rta.msstock.entity.StockItem;
import rta.msstock.repository.StockItemRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {
    private final StockItemRepository stockItemRepository;

    public List<StockItem> getAllItems() {
        return stockItemRepository.findAll();
    }

    public StockItem getItemById(Long id) {
        return stockItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock item not found with id: " + id));
    }

    public StockItem getItemByCode(String itemCode) {
        return stockItemRepository.findByItemCode(itemCode)
                .orElseThrow(() -> new RuntimeException("Stock item not found with code: " + itemCode));
    }

    public StockItem createItem(StockItem item) {
        return stockItemRepository.save(item);
    }

    public StockItem updateItem(Long id, StockItem itemDetails) {
        StockItem item = getItemById(id);
        item.setName(itemDetails.getName());
        item.setCategory(itemDetails.getCategory());
        item.setQuantity(itemDetails.getQuantity());
        item.setMinQuantity(itemDetails.getMinQuantity());
        item.setUnit(itemDetails.getUnit());
        item.setUnitPrice(itemDetails.getUnitPrice());
        item.setSupplier(itemDetails.getSupplier());
        return stockItemRepository.save(item);
    }

    public void deleteItem(Long id) {
        StockItem item = getItemById(id);
        stockItemRepository.delete(item);
    }

    public List<StockItem> getItemsByCategory(String category) {
        return stockItemRepository.findByCategory(category);
    }

    public List<StockItem> getLowStockItems() {
        return stockItemRepository.findLowStockItems();
    }

    public StockItem restockItem(Long id, Integer quantity) {
        StockItem item = getItemById(id);
        item.setQuantity(item.getQuantity() + quantity);
        item.setLastRestocked(LocalDateTime.now());
        return stockItemRepository.save(item);
    }

    public StockItem consumeStock(Long id, Integer quantity) {
        StockItem item = getItemById(id);
        if (item.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for item: " + item.getName());
        }
        item.setQuantity(item.getQuantity() - quantity);
        return stockItemRepository.save(item);
    }
}
