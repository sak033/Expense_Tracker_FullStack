package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    List<Settlement> findByGroupIdAndStatus(Long groupId, String status);

    @Modifying
    @Transactional
    void deleteByGroupId(Long groupId);

    Optional<Settlement>
    findByGroupIdAndFromUserAndToUserAndStatus(
            Long groupId,
            String fromUser,
            String toUser,
            String status
    );
}

