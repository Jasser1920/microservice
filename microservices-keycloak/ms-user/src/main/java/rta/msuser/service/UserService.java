package rta.msuser.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import rta.msuser.entity.ActivityLog;
import rta.msuser.entity.User;
import rta.msuser.repository.ActivityLogRepository;
import rta.msuser.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User getOrCreateUser(String email, String firstName, String lastName, String role) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail(email);
                    user.setFirstName(firstName == null || firstName.isBlank() ? "Client" : firstName);
                    user.setLastName(lastName == null || lastName.isBlank() ? "User" : lastName);
                    user.setPhone("");
                    user.setRole(role == null || role.isBlank() ? "CLIENT" : role);
                    user.setActive(true);
                    return userRepository.save(user);
                });
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setRole(userDetails.getRole());
        user.setPreferences(userDetails.getPreferences());
        user.setActive(userDetails.getActive());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    public List<ActivityLog> getUserActivity(Long userId) {
        return activityLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public ActivityLog logActivity(ActivityLog activityLog) {
        return activityLogRepository.save(activityLog);
    }
}
