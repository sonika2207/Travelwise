package com.travelplanner.weather.service.impl;

import com.travelplanner.auth.entity.User;
import com.travelplanner.auth.repository.UserRepository;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.trip.repository.TripRepository;
import com.travelplanner.weather.dto.WeatherResponse;
import com.travelplanner.weather.entity.DataType;
import com.travelplanner.weather.entity.WeatherData;
import com.travelplanner.weather.repository.WeatherRepository;
import com.travelplanner.weather.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeatherServiceImpl implements WeatherService {

    private final WeatherRepository weatherRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.base.url}")
    private String baseUrl;

    @Value("${weather.geo.url}")
    private String geoUrl;

    // ------------------------------------------------------------------ //
    //  GET  /api/trips/{tripId}/weather
    // ------------------------------------------------------------------ //
    @Override
    @Transactional(readOnly = true)
    public List<WeatherResponse> getWeatherForTrip(Long tripId, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);
        return weatherRepository.findByTripOrderByWeatherDate(trip)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------ //
    //  POST  /api/trips/{tripId}/weather/refresh
    // ------------------------------------------------------------------ //
    @Override
    @Transactional
    public List<WeatherResponse> refreshWeatherForTrip(Long tripId, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);

        // Delete stale records for this trip
        weatherRepository.deleteByTrip(trip);

        // Decide whether the trip is within forecast range (≤5 days from now)
        boolean useForecast = !trip.getStartDate().isAfter(LocalDate.now().plusDays(5));

        List<WeatherData> saved;
        if (useForecast) {
            saved = fetchForecast(trip);
        } else {
            saved = buildTypicalData(trip);
        }

        return saved.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ------------------------------------------------------------------ //
    //  Private helpers
    // ------------------------------------------------------------------ //

    /** Resolves and ownership-checks the trip. Throws if not found / not owned. */
    private Trip resolveTrip(Long tripId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        return tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found or access denied"));
    }

    /**
     * Fetches a 5-day / 3-hour forecast from OpenWeatherMap and aggregates
     * it into one WeatherData record per day.
     */
    @SuppressWarnings("unchecked")
    private List<WeatherData> fetchForecast(Trip trip) {
        // Step 1: Geocode the destination city
        String geoEndpoint = geoUrl + "/direct?q=" + trip.getDestinationCity()
                + "," + trip.getDestinationCountry()
                + "&limit=1&appid=" + apiKey;

        ResponseEntity<List> geoResponse = restTemplate.getForEntity(geoEndpoint, List.class);
        List<Map<String, Object>> geoList = geoResponse.getBody();

        if (geoList == null || geoList.isEmpty()) {
            // Fallback to typical data when geocoding fails
            return buildTypicalData(trip);
        }

        Map<String, Object> location = geoList.get(0);
        double lat = ((Number) location.get("lat")).doubleValue();
        double lon = ((Number) location.get("lon")).doubleValue();

        // Step 2: Fetch forecast
        String forecastEndpoint = baseUrl + "/forecast?lat=" + lat + "&lon=" + lon
                + "&appid=" + apiKey + "&units=metric";

        ResponseEntity<Map> forecastResponse = restTemplate.getForEntity(forecastEndpoint, Map.class);
        Map<String, Object> body = forecastResponse.getBody();

        if (body == null || !body.containsKey("list")) {
            return buildTypicalData(trip);
        }

        List<Map<String, Object>> entries = (List<Map<String, Object>>) body.get("list");

        // Aggregate by day
        Map<LocalDate, List<Map<String, Object>>> byDay = new java.util.LinkedHashMap<>();
        for (Map<String, Object> entry : entries) {
            String dtTxt = (String) entry.get("dt_txt");       // "2024-07-20 12:00:00"
            LocalDate date = LocalDate.parse(dtTxt.substring(0, 10));
            byDay.computeIfAbsent(date, d -> new ArrayList<>()).add(entry);
        }

        List<WeatherData> result = new ArrayList<>();
        for (Map.Entry<LocalDate, List<Map<String, Object>>> dayEntry : byDay.entrySet()) {
            LocalDate date = dayEntry.getKey();
            if (date.isBefore(trip.getStartDate()) || date.isAfter(trip.getEndDate())) continue;

            List<Map<String, Object>> slots = dayEntry.getValue();
            double minTemp = Double.MAX_VALUE, maxTemp = -Double.MAX_VALUE, sumTemp = 0;
            int sumHumidity = 0;
            String description = "";
            String iconCode = "";

            for (Map<String, Object> slot : slots) {
                Map<String, Object> main = (Map<String, Object>) slot.get("main");
                double temp = ((Number) main.get("temp")).doubleValue();
                double tMin = ((Number) main.get("temp_min")).doubleValue();
                double tMax = ((Number) main.get("temp_max")).doubleValue();
                int humidity = ((Number) main.get("humidity")).intValue();

                sumTemp += temp;
                if (tMin < minTemp) minTemp = tMin;
                if (tMax > maxTemp) maxTemp = tMax;
                sumHumidity += humidity;

                List<Map<String, Object>> weatherList = (List<Map<String, Object>>) slot.get("weather");
                if (weatherList != null && !weatherList.isEmpty()) {
                    description = (String) weatherList.get(0).get("description");
                    iconCode    = (String) weatherList.get(0).get("icon");
                }
            }

            WeatherData wd = WeatherData.builder()
                    .trip(trip)
                    .weatherDate(date)
                    .dataType(DataType.FORECAST)
                    .avgTemp(sumTemp / slots.size())
                    .minTemp(minTemp)
                    .maxTemp(maxTemp)
                    .humidity(sumHumidity / slots.size())
                    .rainChance(null)
                    .description(description)
                    .iconCode(iconCode)
                    .build();

            result.add(weatherRepository.save(wd));
        }

        return result;
    }

    /**
     * Generates placeholder "typical" WeatherData records when the trip is
     * too far in the future for a real forecast.
     */
    private List<WeatherData> buildTypicalData(Trip trip) {
        List<WeatherData> result = new ArrayList<>();
        LocalDate current = trip.getStartDate();

        while (!current.isAfter(trip.getEndDate())) {
            WeatherData wd = WeatherData.builder()
                    .trip(trip)
                    .weatherDate(current)
                    .dataType(DataType.TYPICAL)
                    .avgTemp(22.0)
                    .minTemp(18.0)
                    .maxTemp(28.0)
                    .humidity(60)
                    .rainChance(20.0)
                    .description("Typical weather – forecast unavailable")
                    .iconCode("01d")
                    .build();

            result.add(weatherRepository.save(wd));
            current = current.plusDays(1);
        }

        return result;
    }

    private WeatherResponse toResponse(WeatherData w) {
        return WeatherResponse.builder()
                .id(w.getId())
                .tripId(w.getTrip().getId())
                .weatherDate(w.getWeatherDate())
                .dataType(w.getDataType())
                .avgTemp(w.getAvgTemp())
                .minTemp(w.getMinTemp())
                .maxTemp(w.getMaxTemp())
                .humidity(w.getHumidity())
                .rainChance(w.getRainChance())
                .description(w.getDescription())
                .iconCode(w.getIconCode())
                .fetchedAt(w.getFetchedAt())
                .build();
    }
}
