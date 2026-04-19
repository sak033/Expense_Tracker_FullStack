package com.expensetracker.backend.controller;

import com.expensetracker.backend.entity.*;
import com.expensetracker.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public Expense addExpense(@RequestBody Expense expense) {

        // fetch paidBy user
        User paidBy = userRepository.findById(expense.getPaidBy().getId()).orElseThrow();

        // fetch group
        Group group = groupRepository.findById(expense.getGroup().getId()).orElseThrow();

        expense.setPaidBy(paidBy);
        expense.setGroup(group);

        // split equally
        List<ExpenseSplit> splits = expense.getSplits();
        double splitAmount = expense.getAmount() / splits.size();

        for (ExpenseSplit split : splits) {
            User user = userRepository.findById(split.getUser().getId()).orElseThrow();
            split.setUser(user);
            split.setAmountOwed(splitAmount);
            split.setExpense(expense);
        }

        return expenseRepository.save(expense);
    }
}