package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.GroupDTO;
import com.expensetracker.backend.entity.*;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.GroupRepository;
import com.expensetracker.backend.repository.SettlementRepository;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

import java.util.List;
import java.util.*;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;

import jakarta.servlet.http.HttpServletResponse;

import com.expensetracker.backend.dto.SettlementDTO;



@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private SettlementRepository settlementRepository;


    @PostMapping
    public Group createGroup(@RequestBody Group group) {

        // fetch users from DB using IDs
        List<User> users = userRepository.findAllById(
                group.getMembers().stream().map(User::getId).toList()
        );

        group.setMembers(users);

        return groupRepository.save(group);
    }


    @GetMapping
    public List<GroupDTO> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(group -> new GroupDTO(
                        group.getId(),
                        group.getName(),
                        group.getMembers().size() // 👈 safe here
                ))
                .toList();
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
    public List<Settlement> settleBalances(@PathVariable Long groupId) {

        // 🔥 delete old settlements
      //  settlementRepository.deleteByGroupId(groupId);

        Map<String, Double> balances = getBalances(groupId);

        List<Map.Entry<String, Double>> creditors = new ArrayList<>();
        List<Map.Entry<String, Double>> debtors = new ArrayList<>();

        for (Map.Entry<String, Double> entry : balances.entrySet()) {
            if (entry.getValue() > 0) creditors.add(entry);
            else if (entry.getValue() < 0) debtors.add(entry);
        }

        List<Settlement> result = new ArrayList<>();

        int i = 0, j = 0;

        while (i < debtors.size() && j < creditors.size()) {

            String debtor = debtors.get(i).getKey();
            double debt = -debtors.get(i).getValue();

            String creditor = creditors.get(j).getKey();
            double credit = creditors.get(j).getValue();

            double settledAmount = Math.min(debt, credit);

            // 🔥 CREATE ENTITY
            Settlement s = new Settlement();
            s.setFromUser(debtor);
            s.setToUser(creditor);
            s.setAmount(settledAmount);
            s.setStatus("PENDING");
            s.setGroupId(groupId);

            settlementRepository.save(s); // ✅ SAVE

            result.add(s);

            double remainingDebt = debt - settledAmount;
            double remainingCredit = credit - settledAmount;

            debtors.get(i).setValue(-remainingDebt);
            creditors.get(j).setValue(remainingCredit);

            if (remainingDebt == 0) i++;
            if (remainingCredit == 0) j++;
        }

        return result;
    }

    @GetMapping("/{groupId}/join-link")
    public String getJoinLink(@PathVariable Long groupId) {

        return "http://localhost:3000/join?groupId=" + groupId;
    }


    @GetMapping("/{groupId}/qr")
    public void generateQR(@PathVariable Long groupId, HttpServletResponse response) {

        try {
            String joinLink = "http://localhost:3000/join?groupId=" + groupId;

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(joinLink, BarcodeFormat.QR_CODE, 300, 300);

            response.setContentType("image/png");

            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", response.getOutputStream());

        } catch (Exception e) {
            throw new RuntimeException("QR generation failed");
        }
    }

    @GetMapping("/{groupId}/payment-qr")
    public void generatePaymentQR(
            @PathVariable Long groupId,
            @RequestParam String to,
            @RequestParam double amount,
            HttpServletResponse response) {

        try {
            User receiver = userRepository.findByName(to)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String upiLink = "upi://pay?pa=" + receiver.getUpiId()
                    + "&pn=" + receiver.getName()
                    + "&am=" + amount;

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(upiLink, BarcodeFormat.QR_CODE, 300, 300);

            response.setContentType("image/png");
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", response.getOutputStream());

        } catch (Exception e) {
            throw new RuntimeException("Payment QR failed");
        }
    }
    @PostMapping("/{groupId}/add-member/{userId}")
    public Group addMember(@PathVariable Long groupId, @PathVariable Long userId) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // avoid duplicate
        if (!group.getMembers().contains(user)) {
            group.getMembers().add(user);
        }

        return groupRepository.save(group);
    }

    @GetMapping("/{groupId}/members")
    public List<User> getMembers(@PathVariable Long groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        return group.getMembers();
    }


}

