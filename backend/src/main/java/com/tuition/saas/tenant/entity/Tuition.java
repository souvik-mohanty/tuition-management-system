package com.tuition.saas.tenant.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tuitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tuition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TuitionStatus status = TuitionStatus.ACTIVE;
}
