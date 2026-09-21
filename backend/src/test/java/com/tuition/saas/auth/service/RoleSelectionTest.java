package com.tuition.saas.auth.service;

import com.tuition.saas.auth.dto.LoginResponse.MembershipDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RoleSelectionTest {

    private final List<MembershipDto> memberships = List.of(
            new MembershipDto("1", "Alpha Academy", "OWNER"),
            new MembershipDto("2", "Beta Coaching", "TEACHER"),
            new MembershipDto("3", "Gamma Tutors", "TEACHER"));

    @Test
    void noRoleChosenReturnsEverything() {
        assertEquals(3, AuthService.selectByRole(memberships, null).size());
    }

    @Test
    void returnsOnlyMembershipsWithTheChosenRole() {
        List<MembershipDto> teacher = AuthService.selectByRole(memberships, "TEACHER");
        assertEquals(List.of("2", "3"), teacher.stream().map(MembershipDto::tuitionId).toList());
    }

    @Test
    void returnsNothingWhenAccountLacksTheRole() {
        assertTrue(AuthService.selectByRole(memberships, "STUDENT").isEmpty());
    }
}
