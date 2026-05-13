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

    @Value("${OPENROUTER_API_KEY}")
    private String apiKey;

    public String generateResponse(String prompt) {

        try {

            String endpoint = "https://openrouter.ai/api/v1/chat/completions";

            URL url = new URL(endpoint);

            HttpURLConnection conn =
                    (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");

            conn.setRequestProperty("Authorization", "Bearer " + apiKey);

            conn.setRequestProperty("Content-Type", "application/json");

            conn.setDoOutput(true);

            ObjectMapper mapper = new ObjectMapper();

            Map<String, Object> bodyMap = Map.of(
                    "model", "arcee-ai/trinity-large-thinking:free",
                    "messages", new Object[]{
                            Map.of(
                                    "role", "user",
                                    "content", prompt
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

            StringBuilder response = new StringBuilder();

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