package com.tuition.saas.config;

import com.tuition.saas.tenant.entity.Tuition;
import com.tuition.saas.tenant.entity.UserTuitionRole;
import com.tuition.saas.tenant.repository.TuitionRepository;
import com.tuition.saas.tenant.repository.UserTuitionRoleRepository;
import com.tuition.saas.user.entity.Role;
import com.tuition.saas.user.entity.User;
import com.tuition.saas.user.repository.RoleRepository;
import com.tuition.saas.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Ensures the fixed roles exist and, if SEED_OWNER_PHONE and/or SEED_OWNER_EMAIL is set, a demo tuition + owner to log
 * in with. If that owner already exists without an email, SEED_OWNER_EMAIL is filled in so Google sign-in can match it.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final List<String> ROLES = List.of("SUPER_ADMIN", "TUITION_ADMIN", "TEACHER", "STUDENT", "PARENT");

    private final RoleRepository roles;
    private final UserRepository users;
    private final TuitionRepository tuitions;
    private final UserTuitionRoleRepository memberships;
    private final String ownerPhone;
    private final String ownerEmail;
    private final String ownerName;

    public DataInitializer(RoleRepository roles, UserRepository users, TuitionRepository tuitions,
                           UserTuitionRoleRepository memberships,
                           @Value("${app.seed.owner-phone:}") String ownerPhone,
                           @Value("${app.seed.owner-email:}") String ownerEmail,
                           @Value("${app.seed.owner-name:Demo Owner}") String ownerName) {
        this.roles = roles;
        this.users = users;
        this.tuitions = tuitions;
        this.memberships = memberships;
        this.ownerPhone = ownerPhone.trim();
        this.ownerEmail = ownerEmail.trim();
        this.ownerName = ownerName;
    }

    @Override
    @Transactional
    public void run(String... args) {
        ROLES.forEach(name -> {
            if (roles.findByName(name).isEmpty()) {
                Role role = new Role();
                role.setName(name);
                roles.save(role);
            }
        });

        if (ownerPhone.isBlank() && ownerEmail.isBlank()) {
            return;
        }
        Optional<User> existing = !ownerPhone.isBlank()
                ? users.findByPhone(ownerPhone)
                : users.findByEmailIgnoreCase(ownerEmail);
        if (existing.isPresent()) {
            User user = existing.get();
            if (!ownerEmail.isBlank() && (user.getEmail() == null || user.getEmail().isBlank())) {
                user.setEmail(ownerEmail.toLowerCase());
                users.save(user);
                log.info("Set email on existing owner {}", ownerPhone.isBlank() ? ownerEmail : ownerPhone);
            }
            return;
        }
        User owner = users.save(User.builder()
                .name(ownerName)
                .phone(ownerPhone.isBlank() ? null : ownerPhone)
                .email(ownerEmail.isBlank() ? null : ownerEmail.toLowerCase())
                .build());
        Tuition tuition = tuitions.save(Tuition.builder().name("Demo Tuition Center").build());
        Role ownerRole = roles.findByName("TUITION_ADMIN").orElseThrow();
        memberships.save(UserTuitionRole.builder().user(owner).tuition(tuition).role(ownerRole).build());
        log.info("Seeded demo owner {} with tuition '{}'", ownerPhone.isBlank() ? ownerEmail : ownerPhone, tuition.getName());
    }
}
