    
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
        // --- Initialization logic to create default users on startup ---
    @jakarta.annotation.PostConstruct
    public void initDefaultUsers() {
        createUserIfNotExists("admin@hotel.com", "admin", "admin", "0123456789", "ADMIN");
        createUserIfNotExists("manager@hotel.com", "manager", "manager", "0123456789", "MANAGER");
        createUserIfNotExists("staff@hotel.com", "staff", "staff", "0123456789", "STAFF");
        createUserIfNotExists("client1@email.com", "client1", "client1", "0123456789", "CLIENT");
        createUserIfNotExists("client2@email.com", "client2", "client2", "0123456789", "CLIENT");
    }

    private void createUserIfNotExists(String email, String firstName, String lastName, String phone, String role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPhone(phone);
            user.setRole(role);
            user.setActive(true);
            userRepository.save(user);
        }
    }
}
