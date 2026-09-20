package com.tuition.saas.tenant.repository;

import com.tuition.saas.tenant.entity.Tuition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TuitionRepository extends JpaRepository<Tuition, Long> {
}
