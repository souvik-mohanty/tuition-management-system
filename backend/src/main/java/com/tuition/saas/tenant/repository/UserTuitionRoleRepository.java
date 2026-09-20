package com.tuition.saas.tenant.repository;

import com.tuition.saas.tenant.entity.UserTuitionRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserTuitionRoleRepository extends JpaRepository<UserTuitionRole, Long> {

    List<UserTuitionRole> findByUserId(Long userId);
}
