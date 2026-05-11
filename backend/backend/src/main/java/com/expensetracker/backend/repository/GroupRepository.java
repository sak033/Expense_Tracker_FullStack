package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.Group;
import com.expensetracker.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {

    List<Group> findByMembersContaining(User user);
}