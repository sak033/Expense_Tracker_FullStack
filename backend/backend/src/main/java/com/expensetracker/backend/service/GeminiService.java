package com.expensetracker.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="
                            + apiKey;

            URL url = new URL(endpoint);

            HttpURLConnection conn =
                    (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String body = """
            {
              "contents": [{
                "parts": [{
                  "text": "%s"
                }]
              }]
            }
            """.formatted(prompt.replace("\"", "\\\""));

            OutputStream os = conn.getOutputStream();
            os.write(body.getBytes());
            os.flush();
            os.close();

            Scanner scanner =
                    new Scanner(conn.getInputStream());

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