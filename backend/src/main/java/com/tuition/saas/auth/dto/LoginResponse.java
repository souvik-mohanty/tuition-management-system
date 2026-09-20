package com.tuition.saas.auth.dto;

import java.util.List;

/** Shape consumed by the frontend AuthSession. Ids are strings so clients never depend on numeric ids. */
public record LoginResponse(String accessToken, UserDto user, List<MembershipDto> memberships) {

    public record UserDto(String id, String name, String phone, String email) {
    }

    /** role is one of OWNER, TEACHER, STUDENT, PARENT. */
    public record MembershipDto(String tuitionId, String tuitionName, String role) {
    }
}
