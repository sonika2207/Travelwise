package com.travelplanner.packing.service.impl;

import com.travelplanner.auth.entity.User;
import com.travelplanner.auth.repository.UserRepository;
import com.travelplanner.packing.dto.CustomItemRequest;
import com.travelplanner.packing.dto.GeneratePackingResponse;
import com.travelplanner.packing.dto.PackingItemResponse;
import com.travelplanner.packing.dto.PackingProgressResponse;
import com.travelplanner.packing.entity.ConditionType;
import com.travelplanner.packing.entity.Operator;
import com.travelplanner.packing.entity.PackingItem;
import com.travelplanner.packing.entity.PackingRule;
import com.travelplanner.packing.repository.PackingItemRepository;
import com.travelplanner.packing.repository.PackingRuleRepository;
import com.travelplanner.packing.service.PackingService;
import com.travelplanner.trip.entity.Trip;
import com.travelplanner.trip.repository.TripRepository;
import com.travelplanner.weather.entity.WeatherData;
import com.travelplanner.weather.repository.WeatherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackingServiceImpl implements PackingService {

    private final PackingItemRepository packingItemRepository;
    private final PackingRuleRepository packingRuleRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final WeatherRepository weatherRepository;

    // ------------------------------------------------------------------ //
    //  Generate
    // ------------------------------------------------------------------ //

    @Override
    @Transactional
    public GeneratePackingResponse generatePackingList(Long tripId, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);

        // Gather weather aggregates for the trip
        List<WeatherData> weatherList = weatherRepository.findByTripOrderByWeatherDate(trip);

        OptionalDouble avgTempOpt   = weatherList.stream().filter(w -> w.getAvgTemp()    != null).mapToDouble(WeatherData::getAvgTemp).average();
        OptionalDouble rainChanceOpt= weatherList.stream().filter(w -> w.getRainChance() != null).mapToDouble(WeatherData::getRainChance).average();
        OptionalDouble humidityOpt  = weatherList.stream().filter(w -> w.getHumidity()   != null).mapToDouble(WeatherData::getHumidity).average();
        OptionalDouble minTempOpt   = weatherList.stream().filter(w -> w.getMinTemp()    != null).mapToDouble(WeatherData::getMinTemp).min();
        OptionalDouble maxTempOpt   = weatherList.stream().filter(w -> w.getMaxTemp()    != null).mapToDouble(WeatherData::getMaxTemp).max();

        double avgTemp    = avgTempOpt.orElse(22.0);
        double rainChance = rainChanceOpt.orElse(0.0);
        double humidity   = humidityOpt.orElse(50.0);
        double minTemp    = minTempOpt.orElse(avgTemp);
        double maxTemp    = maxTempOpt.orElse(avgTemp);
        long   duration   = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
        String tripType   = trip.getTripType() != null ? trip.getTripType().toUpperCase() : "";

        // Evaluate all rules
        List<PackingRule> rules = packingRuleRepository.findAll();
        int newItemsAdded = 0;

        for (PackingRule rule : rules) {
            if (!evaluateRule(rule, avgTemp, minTemp, maxTemp, rainChance, humidity, duration, tripType)) {
                continue;
            }

            // Skip if a non-custom item with the same name already exists for this trip
            boolean alreadyExists = packingItemRepository
                    .existsByTripAndItemNameAndCustomItemFalse(trip, rule.getSuggestedItem());

            if (!alreadyExists) {
                PackingItem item = PackingItem.builder()
                        .trip(trip)
                        .itemName(rule.getSuggestedItem())
                        .category(rule.getCategory())
                        .checked(false)
                        .customItem(false)
                        .sourceRule(rule)
                        .build();
                packingItemRepository.save(item);
                newItemsAdded++;
            }
        }

        List<PackingItemResponse> allItems = packingItemRepository
                .findByTripOrderByCategory(trip)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return GeneratePackingResponse.builder()
                .newItemsAdded(newItemsAdded)
                .totalItems(allItems.size())
                .items(allItems)
                .message(newItemsAdded == 0
                        ? "Packing list is already up to date."
                        : newItemsAdded + " new item(s) added to your packing list.")
                .build();
    }

    // ------------------------------------------------------------------ //
    //  Get items
    // ------------------------------------------------------------------ //

    @Override
    @Transactional(readOnly = true)
    public List<PackingItemResponse> getPackingItems(Long tripId, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);
        return packingItemRepository.findByTripOrderByCategory(trip)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------ //
    //  Toggle packed
    // ------------------------------------------------------------------ //

    @Override
    @Transactional
    public PackingItemResponse togglePacked(Long itemId, String userEmail) {
        PackingItem item = resolveItem(itemId, userEmail);
        item.setChecked(!item.isChecked());
        return toResponse(packingItemRepository.save(item));
    }

    // ------------------------------------------------------------------ //
    //  Add custom item
    // ------------------------------------------------------------------ //

    @Override
    @Transactional
    public PackingItemResponse addCustomItem(Long tripId, CustomItemRequest request, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);

        PackingItem item = PackingItem.builder()
                .trip(trip)
                .itemName(request.getItemName().trim())
                .category(request.getCategory().trim())
                .checked(false)
                .customItem(true)
                .sourceRule(null)
                .build();

        return toResponse(packingItemRepository.save(item));
    }

    // ------------------------------------------------------------------ //
    //  Delete item
    // ------------------------------------------------------------------ //

    @Override
    @Transactional
    public void deleteItem(Long itemId, String userEmail) {
        PackingItem item = resolveItem(itemId, userEmail);
        packingItemRepository.delete(item);
    }

    // ------------------------------------------------------------------ //
    //  Progress
    // ------------------------------------------------------------------ //

    @Override
    @Transactional(readOnly = true)
    public PackingProgressResponse getProgress(Long tripId, String userEmail) {
        Trip trip = resolveTrip(tripId, userEmail);
        List<PackingItem> items = packingItemRepository.findByTrip(trip);

        int total   = items.size();
        int checked = (int) items.stream().filter(PackingItem::isChecked).count();
        double pct  = total == 0 ? 0.0 : Math.round((checked * 100.0 / total) * 10.0) / 10.0;

        return PackingProgressResponse.builder()
                .checkedItems(checked)
                .totalItems(total)
                .percentage(pct)
                .summary(checked + "/" + total + " packed")
                .build();
    }

    // ------------------------------------------------------------------ //
    //  Rule evaluation engine
    // ------------------------------------------------------------------ //

    private boolean evaluateRule(PackingRule rule,
                                 double avgTemp, double minTemp, double maxTemp,
                                 double rainChance, double humidity,
                                 long duration, String tripType) {

        ConditionType type = rule.getConditionType();
        Operator op        = rule.getOperator();

        // String equality rules (TRIP_TYPE = VALUE)
        if (type == ConditionType.TRIP_TYPE) {
            if (op != Operator.EQUAL || rule.getThresholdText() == null) return false;
            return rule.getThresholdText().equalsIgnoreCase(tripType);
        }

        // Numeric rules
        if (rule.getThresholdValue() == null) return false;
        double threshold = rule.getThresholdValue();

        double actual = switch (type) {
            case AVG_TEMP    -> avgTemp;
            case MIN_TEMP    -> minTemp;
            case MAX_TEMP    -> maxTemp;
            case RAIN_CHANCE -> rainChance;
            case HUMIDITY    -> humidity;
            case DURATION    -> (double) duration;
            default          -> 0.0;
        };

        return switch (op) {
            case LESS_THAN              -> actual < threshold;
            case LESS_THAN_OR_EQUAL     -> actual <= threshold;
            case GREATER_THAN           -> actual > threshold;
            case GREATER_THAN_OR_EQUAL  -> actual >= threshold;
            case EQUAL                  -> Double.compare(actual, threshold) == 0;
        };
    }

    // ------------------------------------------------------------------ //
    //  Private helpers
    // ------------------------------------------------------------------ //

    private Trip resolveTrip(Long tripId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Trip not found or access denied"));
    }

    private PackingItem resolveItem(Long itemId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        PackingItem item = packingItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Packing item not found"));
        if (!item.getTrip().getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return item;
    }

    private PackingItemResponse toResponse(PackingItem item) {
        return PackingItemResponse.builder()
                .id(item.getId())
                .tripId(item.getTrip().getId())
                .itemName(item.getItemName())
                .category(item.getCategory())
                .checked(item.isChecked())
                .customItem(item.isCustomItem())
                .sourceRuleId(item.getSourceRule() != null ? item.getSourceRule().getId() : null)
                .createdAt(item.getCreatedAt())
                .build();
    }
}
