package com.travelplanner.photo.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class PexelsPhotoClient {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String baseUrl;

    public PexelsPhotoClient(
            RestTemplate restTemplate,
            @Value("${photo.api.key}") String apiKey,
            @Value("${photo.base.url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    public PexelsResponse searchPhoto(String query) {
        try {
            String url = baseUrl + "/v1/search?query=" + query + "&per_page=1";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", apiKey);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<PexelsResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    PexelsResponse.class
            );
            
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch photo from Pexels API for query: {}", query, e);
            return null; // Return null to let the service handle the fallback
        }
    }
}
