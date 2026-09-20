package com.tuition.saas.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    // E.164 (e.g. +919000000001), the identity verified by Firebase phone auth.
    @Column(unique = true)
    private String phone;

    private String password;
}



