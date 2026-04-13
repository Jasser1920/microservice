package rta.msstock.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rta.msstock.entity.StockItem;
import rta.msstock.service.StockService;

import java.util.List;

@RestController
@RequestMapping("/stock")
@RequiredArgsConstructor
public class StockController {
    private final StockService stockService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<StockItem>> getAllItems() {
        return ResponseEntity.ok(stockService.getAllItems());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<StockItem> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.getItemById(id));
    }

    @GetMapping("/code/{itemCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<StockItem> getItemByCode(@PathVariable String itemCode) {
        return ResponseEntity.ok(stockService.getItemByCode(itemCode));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<StockItem> createItem(@RequestBody StockItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.createItem(item));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<StockItem> updateItem(@PathVariable Long id, @RequestBody StockItem item) {
        return ResponseEntity.ok(stockService.updateItem(id, item));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        stockService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<StockItem>> getItemsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(stockService.getItemsByCategory(category));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<StockItem>> getLowStockItems() {
        return ResponseEntity.ok(stockService.getLowStockItems());
    }

    @PatchMapping("/{id}/restock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<StockItem> restockItem(@PathVariable Long id, @RequestParam Integer quantity) {
        return ResponseEntity.ok(stockService.restockItem(id, quantity));
    }

    @PatchMapping("/{id}/consume")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<StockItem> consumeStock(@PathVariable Long id, @RequestParam Integer quantity) {
        return ResponseEntity.ok(stockService.consumeStock(id, quantity));
    }
}
