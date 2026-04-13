package rta.msreview.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rta.msreview.entity.Review;
import rta.msreview.repository.ReviewRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review getReviewById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));
    }

    public Review createReview(Review review) {
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        return reviewRepository.save(review);
    }

    public Review updateReview(Long id, Review reviewDetails) {
        Review review = getReviewById(id);
        review.setRating(reviewDetails.getRating());
        review.setComment(reviewDetails.getComment());
        return reviewRepository.save(review);
    }

    public void deleteReview(Long id) {
        Review review = getReviewById(id);
        reviewRepository.delete(review);
    }

    public List<Review> getReviewsByUserId(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    public List<Review> getReviewsByRoomId(Long roomId) {
        return reviewRepository.findByRoomId(roomId);
    }

    public Map<String, Object> getRoomStatistics(Long roomId) {
        Double avgRating = reviewRepository.getAverageRatingByRoomId(roomId);
        Long count = reviewRepository.getReviewCountByRoomId(roomId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("roomId", roomId);
        stats.put("averageRating", avgRating != null ? avgRating : 0.0);
        stats.put("totalReviews", count);
        
        return stats;
    }
}
