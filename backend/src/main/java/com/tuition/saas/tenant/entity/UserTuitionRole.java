package com.tuition.saas.tenant.entity;

import com.tuition.saas.user.entity.Role;
import com.tuition.saas.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_tuition_roles", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "tuition_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTuitionRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "tuition_id", nullable = false)
    private Tuition tuition;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
}
