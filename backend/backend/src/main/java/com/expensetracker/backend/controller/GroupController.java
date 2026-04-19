package com.expensetracker.backend.controller;

import com.expensetracker.backend.entity.Group;
import com.expensetracker.backend.entity.User;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.GroupRepository;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

import com.expensetracker.backend.entity.Expense;
import com.expensetracker.backend.entity.ExpenseSplit;

import java.util.List;
import java.util.*;

@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @PostMapping
    public Group createGroup(@RequestBody Group group) {

        // fetch users from DB using IDs
        List<User> users = userRepository.findAllById(
                group.getMembers().stream().map(User::getId).toList()
        );

        group.setMembers(users);

        return groupRepository.save(group);
    }

    @GetMapping("/{groupId}/balances")
    public Map<String, Double> getBalances(@PathVariable Long groupId) {

        Group group = groupRepository.findById(groupId).orElseThrow();

        Map<Long, Double> balanceMap = new HashMap<>();

        // Step 1: initialize all users with 0
        for (User user : group.getMembers()) {
            balanceMap.put(user.getId(), 0.0);
        }

        // Step 2: get all expenses
        List<Expense> expenses = expenseRepository.findAll();

        for (Expense expense : expenses) {

            if (!expense.getGroup().getId().equals(groupId)) continue;

            double total = expense.getAmount();

            // Step 3: add full amount to payer
            Long paidById = expense.getPaidBy().getId();
            balanceMap.put(paidById,
                    balanceMap.get(paidById) + total);

            // Step 4: subtract each user's share
            for (ExpenseSplit split : expense.getSplits()) {
                Long userId = split.getUser().getId();
                balanceMap.put(userId,
                        balanceMap.get(userId) - split.getAmountOwed());
            }
        }

        // Step 5: convert to name → balance
        Map<String, Double> result = new HashMap<>();

        for (User user : group.getMembers()) {
            result.put(user.getName(), balanceMap.get(user.getId()));
        }

        return result;
    }

    @GetMapping("/{groupId}/settle")
    public List<String> settleBalances(@PathVariable Long groupId) {

        Map<String, Double> balances = getBalances(groupId);

        List<Map.Entry<String, Double>> creditors = new ArrayList<>();
        List<Map.Entry<String, Double>> debtors = new ArrayList<>();

        // separate users
        for (Map.Entry<String, Double> entry : balances.entrySet()) {
            if (entry.getValue() > 0) {
                creditors.add(entry);
            } else if (entry.getValue() < 0) {
                debtors.add(entry);
            }
        }

        List<String> transactions = new ArrayList<>();

        int i = 0, j = 0;

        while (i < debtors.size() && j < creditors.size()) {

            String debtor = debtors.get(i).getKey();
            double debt = -debtors.get(i).getValue();

            String creditor = creditors.get(j).getKey();
            double credit = creditors.get(j).getValue();

            double settledAmount = Math.min(debt, credit);

            transactions.add(debtor + " pays " + creditor + " ₹" + settledAmount);

            debtors.get(i).setValue(-(debt - settledAmount));
            creditors.get(j).setValue(credit - settledAmount);

            if (debt - settledAmount == 0) i++;
            if (credit - settledAmount == 0) j++;
        }

        return transactions;
    }
}

