package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findByGroupIdAndStatus(Long groupId, String status);
    void deleteByGroupId(Long groupId);
}