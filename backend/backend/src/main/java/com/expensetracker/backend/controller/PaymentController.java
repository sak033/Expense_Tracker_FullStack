package com.expensetracker.backend.controller;

import com.razorpay.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import com.expensetracker.backend.repository.SettlementRepository;
import com.expensetracker.backend.entity.Settlement;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "https://expense-tracker-full-stack-frontend.vercel.app")
public class PaymentController {

    @Autowired
    private SettlementRepository settlementRepository;

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    @PostMapping("/create-order")
    public Map<String, Object> createOrder(@RequestParam double amount) throws Exception {

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject options = new JSONObject();
        options.put("amount", (int)(amount * 100)); // paisa
        options.put("currency", "INR");
        options.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = client.orders.create(options);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.get("id"));
        response.put("amount", amount);

        return response;
    }

    @PostMapping("/verify")
    public String verifyPayment(@RequestBody Map<String, String> body) throws Exception {

        String razorpayOrderId = body.get("razorpay_order_id");
        String razorpayPaymentId = body.get("razorpay_payment_id");
        String razorpaySignature = body.get("razorpay_signature");

        String generatedSignature = generateSignature(
                razorpayOrderId + "|" + razorpayPaymentId,
                keySecret
        );

        if (!generatedSignature.equals(razorpaySignature)) {
            throw new RuntimeException("Invalid payment signature ❌");
        }

        // ✅ Now safe to mark as PAID
        Long settlementId = Long.parseLong(body.get("settlementId"));

        Settlement s = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        s.setStatus("PAID");
        settlementRepository.save(s);

        return "Payment verified and recorded ✅";
    }

    private String generateSignature(String data, String key) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        javax.crypto.spec.SecretKeySpec secretKey =
                new javax.crypto.spec.SecretKeySpec(key.getBytes(), "HmacSHA256");
        mac.init(secretKey);
        byte[] rawHmac = mac.doFinal(data.getBytes());
        return new String(org.apache.commons.codec.binary.Hex.encodeHex(rawHmac));
    }
}