package com.expensetracker.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

@Service
public class GeminiService {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    public String generateResponse(String prompt) {

        try {

            String endpoint =
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                            + apiKey;

            URL url = new URL(endpoint);

            HttpURLConnection conn =
                    (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            ObjectMapper mapper = new ObjectMapper();

            Map<String, Object> bodyMap = Map.of(
                    "contents", new Object[]{
                            Map.of(
                                    "parts", new Object[]{
                                            Map.of(
                                                    "text", prompt
                                            )
                                    }
                            )
                    }
            );

            String body = mapper.writeValueAsString(bodyMap);

            OutputStream os = conn.getOutputStream();
            os.write(body.getBytes());
            os.flush();
            os.close();

            int responseCode = conn.getResponseCode();

            Scanner scanner;

            if (responseCode >= 200 && responseCode < 300) {
                scanner = new Scanner(conn.getInputStream());
            } else {
                scanner = new Scanner(conn.getErrorStream());

                StringBuilder errorResponse = new StringBuilder();

                while (scanner.hasNext()) {
                    errorResponse.append(scanner.nextLine());
                }

                scanner.close();

                return errorResponse.toString();
            }

            StringBuilder response =
                    new StringBuilder();

            while (scanner.hasNext()) {
                response.append(scanner.nextLine());
            }

            scanner.close();

            return response.toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error generating AI response";
        }
    }
}