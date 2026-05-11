package com.expensetracker.backend.controller;

import com.expensetracker.backend.entity.*;
import com.expensetracker.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.expensetracker.backend.dto.ExpenseRequestDTO;
import java.util.List;
import  java.util.*;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;


    @PostMapping
    public Expense addExpense(@RequestBody ExpenseRequestDTO req) {

        User payer = userRepository.findByName(req.getPaidByName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group group = groupRepository.findById(req.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Expense expense = new Expense();
        expense.setAmount(req.getAmount());
        expense.setPaidBy(payer);
        expense.setGroup(group);

        // 🔥 simple equal split
        List<User> members = group.getMembers();
        double splitAmount = req.getAmount() / members.size();

        List<ExpenseSplit> splits = new ArrayList<>();

        for (User user : members) {
            ExpenseSplit split = new ExpenseSplit();
            split.setUser(user);
            split.setAmountOwed(splitAmount);
            split.setExpense(expense);
            splits.add(split);
        }

        expense.setSplits(splits);

        return expenseRepository.save(expense);
    }

    @GetMapping("/group/{groupId}")
    public List<Expense> getExpensesByGroup(
            @PathVariable Long groupId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        boolean isMember = group.getMembers()
                .stream()
                .anyMatch(user -> user.getId().equals(currentUser.getId()));

        if (!isMember) {
            throw new RuntimeException("Unauthorized");
        }

        return expenseRepository.findAll().stream()
                .filter(e -> e.getGroup().getId().equals(groupId))
                .toList();
    }
}