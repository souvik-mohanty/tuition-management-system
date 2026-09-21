package com.tuition.saas.auth.service;

import com.tuition.saas.auth.dto.LoginResponse;
import com.tuition.saas.common.exception.AuthException;
import com.tuition.saas.tenant.entity.Tuition;
import com.tuition.saas.tenant.entity.TuitionStatus;
import com.tuition.saas.tenant.entity.UserTuitionRole;
import com.tuition.saas.tenant.repository.TuitionRepository;
import com.tuition.saas.tenant.repository.UserTuitionRoleRepository;
import com.tuition.saas.user.entity.Role;
import com.tuition.saas.user.entity.User;
import com.tuition.saas.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceGoogleLoginTest {

    private final GoogleAuthService google = mock(GoogleAuthService.class);
    private final JwtService jwt = mock(JwtService.class);
    private final RedisAuthStore store = mock(RedisAuthStore.class);
    private final UserRepository users = mock(UserRepository.class);
    private final UserTuitionRoleRepository memberships = mock(UserTuitionRoleRepository.class);
    private final TuitionRepository tuitions = mock(TuitionRepository.class);

    private Tuition alpha;

    @BeforeEach
    void setUp() {
        alpha = Tuition.builder().id(7L).name("Alpha Academy").status(TuitionStatus.ACTIVE).build();
        when(google.verify(anyString()))
                .thenReturn(new GoogleAuthService.GoogleIdentity("sub-1", "Person@Example.com", "Pat Person"));
        when(store.markIdTokenUsed(anyString(), any())).thenReturn(true);
        when(store.incrementAttempts(anyString(), any())).thenReturn(1L);
        when(jwt.issueAccessToken(anyLong())).thenReturn("access-token");
        when(users.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(42L);
            return u;
        });
        when(tuitions.findAll()).thenReturn(List.of(alpha));
    }

    private AuthService service(boolean demo) {
        return new AuthService(mock(FirebaseAuthService.class), google, jwt, store, users, memberships, tuitions,
                demo, 300, 20, 10);
    }

    private static UserTuitionRole membership(User user, Tuition tuition, String roleName) {
        Role role = new Role();
        role.setName(roleName);
        return UserTuitionRole.builder().user(user).tuition(tuition).role(role).build();
    }

    @Test
    void unknownGoogleAccountIsRejectedWhenDemoModeIsOff() {
        when(users.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());

        AuthException e = assertThrows(AuthException.class, () -> service(false).loginWithGoogle("t", "TEACHER", "1.1.1.1"));

        assertTrue(e.getMessage().contains("Person@Example.com"));
        verify(users, never()).save(any());
    }

    @Test
    void registeredAccountWithoutTheChosenRoleIsRejectedWhenDemoModeIsOff() {
        User user = User.builder().id(1L).name("Owner").email("person@example.com").build();
        when(users.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(user));
        when(memberships.findByUserId(1L)).thenReturn(List.of(membership(user, alpha, "TUITION_ADMIN")));

        AuthException e = assertThrows(AuthException.class, () -> service(false).loginWithGoogle("t", "TEACHER", "1.1.1.1"));

        assertEquals("This account is not registered as a Teacher.", e.getMessage());
    }

    @Test
    void demoModeCreatesTheUserAndGrantsTheChosenRole() {
        when(users.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());

        LoginResponse r = service(true).loginWithGoogle("t", "STUDENT", "1.1.1.1");

        assertEquals("access-token", r.accessToken());
        assertEquals("Pat Person", r.user().name());
        assertEquals(1, r.memberships().size());
        assertEquals("STUDENT", r.memberships().get(0).role());
        assertEquals("7", r.memberships().get(0).tuitionId());
    }

    @Test
    void demoModeDefaultsToOwnerWhenNoRoleIsSent() {
        when(users.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());

        LoginResponse r = service(true).loginWithGoogle("t", null, "1.1.1.1");

        assertEquals("OWNER", r.memberships().get(0).role());
    }

    @Test
    void demoModeLetsAnExistingUserSwitchToAnyRole() {
        User user = User.builder().id(1L).name("Owner").email("person@example.com").build();
        when(users.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(user));
        when(memberships.findByUserId(1L)).thenReturn(List.of(membership(user, alpha, "TUITION_ADMIN")));

        assertEquals("PARENT", service(true).loginWithGoogle("t", "PARENT", "1.1.1.1").memberships().get(0).role());
        assertEquals("OWNER", service(true).loginWithGoogle("t", "OWNER", "1.1.1.1").memberships().get(0).role());
        verify(users, never()).save(any());
    }

    @Test
    void demoModeCreatesADemoTuitionWhenNoneExists() {
        when(users.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(tuitions.findAll()).thenReturn(List.of());
        when(tuitions.save(any(Tuition.class))).thenAnswer(inv -> {
            Tuition t = inv.getArgument(0);
            t.setId(9L);
            return t;
        });

        LoginResponse r = service(true).loginWithGoogle("t", "TEACHER", "1.1.1.1");

        assertEquals("Demo Tuition Center", r.memberships().get(0).tuitionName());
    }
}
