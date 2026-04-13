package rta.msuser.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import rta.msuser.entity.ActivityLog;
import rta.msuser.entity.User;
import rta.msuser.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'CLIENT')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'CLIENT')")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'CLIENT')")
    public ResponseEntity<User> getCurrentUser(JwtAuthenticationToken authentication) {
        String email = authentication.getToken().getClaimAsString("email");
        String firstName = authentication.getToken().getClaimAsString("given_name");
        String lastName = authentication.getToken().getClaimAsString("family_name");
        String role = resolveRole(authentication);
        return ResponseEntity.ok(userService.getOrCreateUser(email, firstName, lastName, role));
    }

    private String resolveRole(JwtAuthenticationToken authentication) {
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        boolean isManager = hasRole(authentication, "ROLE_MANAGER");
        boolean isStaff = hasRole(authentication, "ROLE_STAFF");
        if (isAdmin) return "ADMIN";
        if (isManager) return "MANAGER";
        if (isStaff) return "STAFF";
        return "CLIENT";
    }

    private boolean hasRole(JwtAuthenticationToken authentication, String role) {
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (role.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @GetMapping("/{id}/activity")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CLIENT')")
    public ResponseEntity<List<ActivityLog>> getUserActivity(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserActivity(id));
    }

    @PostMapping("/activity")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'CLIENT')")
    public ResponseEntity<ActivityLog> logActivity(@RequestBody ActivityLog activityLog) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.logActivity(activityLog));
    }
}
