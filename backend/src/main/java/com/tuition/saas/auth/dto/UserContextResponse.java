package com.tuition.saas.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserContextResponse {

    private Long userId;
    private String name;
    private String email;
    private String phone;

    private Long tuitionId;
    private String tuitionName;

    private String role;
}
