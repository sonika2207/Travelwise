package com.travelplanner.geocoding.service.impl;

import com.travelplanner.geocoding.dto.GeocodingResult;
import com.travelplanner.geocoding.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeocodingServiceImpl implements GeocodingService {

    private final RestTemplate restTemplate;

    @Override
    public GeocodingResult geocode(String location) {
        if (location == null || location.trim().isEmpty()) {
            return null;
        }

        try {
            String url = "https://nominatim.openstreetmap.org/search?q=" + location.trim() + "&format=json&limit=1";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "TravelWise-App/1.0 (contact@travelwise.com)");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            
            if (response.getBody() != null && !response.getBody().isEmpty()) {
                Map<String, Object> firstResult = (Map<String, Object>) response.getBody().get(0);
                
                String latStr = (String) firstResult.get("lat");
                String lonStr = (String) firstResult.get("lon");
                
                if (latStr != null && lonStr != null) {
                    return GeocodingResult.builder()
                            .latitude(Double.parseDouble(latStr))
                            .longitude(Double.parseDouble(lonStr))
                            .build();
                }
            }
        } catch (Exception e) {
            log.error("Failed to geocode location: {}. Error: {}", location, e.getMessage());
        }
        
        return null;
    }
}
