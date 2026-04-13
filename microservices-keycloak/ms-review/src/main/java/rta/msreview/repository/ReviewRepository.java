package rta.msreview.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rta.msreview.entity.Review;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUserId(Long userId);
    List<Review> findByRoomId(Long roomId);
    List<Review> findByRating(Integer rating);
    List<Review> findByVerified(Boolean verified);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.roomId = :roomId")
    Double getAverageRatingByRoomId(Long roomId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.roomId = :roomId")
    Long getReviewCountByRoomId(Long roomId);
}
