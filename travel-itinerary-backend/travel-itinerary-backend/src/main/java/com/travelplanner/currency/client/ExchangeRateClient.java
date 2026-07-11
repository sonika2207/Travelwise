package com.travelplanner.currency.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

/**
 * HTTP client for the open.er-api.com v6 Exchange Rate API.
 * Endpoint: GET https://open.er-api.com/v6/latest/{baseCurrency}
 */
@Slf4j
@Component
public class ExchangeRateClient {

    private final RestTemplate restTemplate;
    private final String apiUrl;

    public ExchangeRateClient(RestTemplate restTemplate,
                               @Value("${currency.api.url}") String apiUrl) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
    }

    /**
     * Fetches the conversion rate from baseCurrency to targetCurrency.
     *
     * @param baseCurrency   ISO 4217 code, e.g. "INR"
     * @param targetCurrency ISO 4217 code, e.g. "USD"
     * @return conversion rate, or {@code null} if the API call fails
     */
    public BigDecimal fetchRate(String baseCurrency, String targetCurrency) {
        try {
            String url = apiUrl + "/" + baseCurrency.toUpperCase();
            log.info("Fetching exchange rate: {} â†’ {} from {}", baseCurrency, targetCurrency, url);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                log.warn("Null response from exchange rate API");
                return null;
            }

            String result = (String) response.get("result");
            if (!"success".equalsIgnoreCase(result)) {
                log.warn("Exchange rate API returned non-success result: {}", result);
                return null;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> rates = (Map<String, Object>) response.get("rates");
            if (rates == null || !rates.containsKey(targetCurrency.toUpperCase())) {
                log.warn("Target currency {} not found in API response", targetCurrency);
                return null;
            }

            Object rateObj = rates.get(targetCurrency.toUpperCase());
            return new BigDecimal(rateObj.toString());

        } catch (Exception ex) {
            log.error("Failed to fetch exchange rate {} â†’ {}: {}", baseCurrency, targetCurrency, ex.getMessage());
            return null;
        }
    }
}
