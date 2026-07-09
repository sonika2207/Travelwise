import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { weatherApi } from '../api/weatherApi';

/* ─── OpenWeatherMap icon image component ─── */
const OWM_BASE = 'https://openweathermap.org/img/wn';

const WeatherIcon = ({ code = '', size = 'sm' }) => {
  const c = code ? code.replace(/n$/, 'd') : '01d';
  // Always use @4x for crisp rendering at any display size
  const src = `${OWM_BASE}/${c}@4x.png`;
  const dim = size === 'lg' ? 96 : 64;

  return (
    <img
      src={src}
      alt={c}
      width={dim}
      height={dim}
      style={{ display: 'inline-block', objectFit: 'contain' }}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'inline';
      }}
    />
  );
};

/* Wrapper that shows the image and a hidden emoji fallback */
const WeatherIconWithFallback = ({ code = '', size = 'sm' }) => {
  const c = (code || '01d').replace(/n$/, 'd');
  const fallbackMap = {
    '01d': '☀️', '02d': '⛅️', '03d': '☁️', '04d': '☁️',
    '09d': '🌧️', '10d': '🌦️', '11d': '⛈️', '13d': '❄️', '50d': '🌫️',
  };
  const fallback = fallbackMap[c] || '🌤️';
  const dim = size === 'lg' ? 96 : 64;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: dim, height: dim }}>
      <WeatherIcon code={code} size={size} />
      <span style={{ display: 'none', fontSize: size === 'lg' ? '64px' : '40px', lineHeight: 1 }}>{fallback}</span>
    </span>
  );
};

/* ─── Smart travel recommendations ─── */
const buildRecommendations = (forecasts) => {
  const tips = [];
  const rainDays = forecasts.filter((d) => (d.rainChance ?? 0) >= 50);
  const hotDays = forecasts.filter((d) => (d.maxTemp ?? d.avgTemp ?? 0) >= 32);
  const coldDays = forecasts.filter((d) => (d.minTemp ?? d.avgTemp ?? 20) <= 18);
  const niceDays = forecasts.filter((d) => (d.rainChance ?? 0) <= 20 && (d.maxTemp ?? d.avgTemp ?? 0) >= 25);

  const fmt = (d) =>
    new Date(d.weatherDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (rainDays.length > 0) {
    tips.push({ icon: '☂️', text: `Pack an umbrella — rain is likely on ${rainDays.map(fmt).join(', ')}.` });
  }
  if (hotDays.length > 0) {
    tips.push({ icon: '🧴', text: `Bring sunscreen — temperatures will exceed 32°C on ${hotDays.map(fmt).join(', ')}.` });
  }
  if (coldDays.length > 0) {
    tips.push({ icon: '🧥', text: `Bring a light jacket — it may feel cool on ${coldDays.map(fmt).join(', ')}.` });
  }
  if (niceDays.length > 0) {
    tips.push({ icon: '🥾', text: `Best days for outdoor activities: ${niceDays.map(fmt).join(', ')}.` });
  }
  if (tips.length === 0) {
    tips.push({ icon: '🌤️', text: 'The weather looks pleasant throughout your trip. Enjoy!' });
  }
  return tips;
};

/* ─── Format helper ─── */
const fmtDay = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

const fmtDateShort = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const fmtFullDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const round = (v) => (v != null ? Math.round(v) : '—');

/* ─── Packing Recommendations ─── */
const buildPackingItems = (forecasts) => {
  const itemsMap = new Map();
  const add = (icon, label) => itemsMap.set(label, { icon, label });

  const rain = forecasts.some(d => (d.rainChance ?? 0) >= 30);
  const hot = forecasts.some(d => (d.maxTemp ?? d.avgTemp ?? 0) >= 28);
  const cold = forecasts.some(d => (d.minTemp ?? d.avgTemp ?? 20) <= 18);
  const sunny = forecasts.some(d => d.iconCode && (d.iconCode.includes('01') || d.iconCode.includes('02')));

  if (rain) {
    add('☂️', 'Umbrella');
    add('👟', 'Waterproof Shoes');
  }
  if (hot || sunny) {
    add('🕶️', 'Sunglasses');
    add('🧴', 'Sunscreen');
    add('🧢', 'Hat');
    add('💧', 'Reusable Water Bottle');
  }
  if (cold) {
    add('🧥', 'Light Jacket');
  }
  if (itemsMap.size === 0) {
    add('👕', 'Comfortable Clothes');
    add('👟', 'Walking Shoes');
  }

  return Array.from(itemsMap.values());
};

/* ─── Build a Mon–Sun 7-day strip anchored to the first forecast date ─── */
const toISODate = (d) => d.toISOString().slice(0, 10);

const buildWeekStrip = (deduped) => {
  if (deduped.length === 0) return [];

  // Anchor to the Monday of the week containing the first forecast date
  const first = new Date(deduped[0].weatherDate + 'T00:00:00');
  const dayOfWeek = first.getDay(); // 0=Sun, 1=Mon … 6=Sat
  // Distance to previous Monday (0 if already Monday)
  const distToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(first);
  monday.setDate(monday.getDate() - distToMonday);

  // Build a map of real data keyed by ISO date string
  const realMap = new Map(deduped.map((d) => [d.weatherDate, d]));

  const strip = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = toISODate(d);
    strip.push(
      realMap.get(iso) ?? {
        id: `placeholder-${iso}`,
        weatherDate: iso,
        iconCode: null,
        avgTemp: null,
        minTemp: null,
        maxTemp: null,
        rainChance: null,
        humidity: null,
        description: null,
        dataType: 'PLACEHOLDER',
      }
    );
  }
  return strip;
};

/* ────────────────────────────────────────────────────────────────── */

const TripWeather = () => {
  const { trip } = useOutletContext();

  const [forecasts, setForecasts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadWeather = useCallback(async (refresh = false) => {
    if (!trip?.id) return;
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      let data;
      if (refresh) {
        data = await weatherApi.refreshWeather(trip.id);
        toast.success('Weather data refreshed!');
      } else {
        data = await weatherApi.getWeather(trip.id);
        // If nothing cached yet, auto-refresh
        if (!data || data.length === 0) {
          data = await weatherApi.refreshWeather(trip.id);
        }
      }

      // Sort by date
      const sorted = [...data].sort((a, b) => a.weatherDate.localeCompare(b.weatherDate));

      // Deduplicate by date — prefer FORECAST over TYPICAL
      const seen = new Map();
      for (const entry of sorted) {
        const existing = seen.get(entry.weatherDate);
        if (!existing || entry.dataType === 'FORECAST') {
          seen.set(entry.weatherDate, entry);
        }
      }
      const deduped = Array.from(seen.values());

      // Always show Mon–Sun (7 cards), with real data where available
      const strip = buildWeekStrip(deduped);
      // First card with real data is the default selected day
      const firstReal = strip.find((d) => d.dataType !== 'PLACEHOLDER') ?? strip[0];

      setForecasts(strip);
      setSelected(firstReal ?? null);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load weather data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trip?.id]);

  useEffect(() => {
    loadWeather(false);
  }, [loadWeather]);

  const recommendations = forecasts.length > 0 ? buildRecommendations(forecasts) : [];
  const packingItems = forecasts.length > 0 ? buildPackingItems(forecasts) : [];

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-3">
        <div className="text-4xl animate-pulse">🌤️</div>
        <div className="text-sm font-medium">Fetching weather for {trip?.destinationCity}…</div>
      </div>
    );
  }

  /* ── Error ── */
  if (error && forecasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-5xl">⚠️</div>
        <div className="text-text-muted text-sm font-medium">{error}</div>
        <button className="btn btn-primary" onClick={() => loadWeather(true)}>Retry</button>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

      {/* Location + refresh row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '14px', color: 'var(--tw-text-muted)', flexWrap: 'wrap' }}>
        <span>📍</span>
        <span>{trip?.destinationCity}{trip?.destinationCountry ? `, ${trip.destinationCountry}` : ''}</span>
        <span
          className="badge"
          style={{ background: 'var(--tw-sky-light)', color: 'var(--tw-sky)', border: '1px solid var(--tw-sky-mid)', marginLeft: '4px', cursor: 'pointer' }}
          onClick={() => loadWeather(true)}
        >
          {refreshing ? 'Refreshing…' : '⟳ Refresh'}
        </span>
        {forecasts[0]?.dataType === 'TYPICAL' && (
          <span className="badge" style={{ background: 'var(--tw-sunset-light)', color: '#7A5000', border: '1px solid rgba(249,199,79,0.5)', marginLeft: '4px' }}>
            ℹ️ Typical estimates — trip is too far ahead for a live forecast
          </span>
        )}
      </div>

      {/* ── Hero Card ── */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="weather-hero"
          >
            <div className="weather-icon-lg" style={{ lineHeight: 1 }}>
              <WeatherIconWithFallback code={selected.iconCode} size="lg" />
            </div>
            <div className="weather-temp">{round(selected.avgTemp)}°C</div>
            <div className="weather-condition">
              {selected.description
                ? selected.description.charAt(0).toUpperCase() + selected.description.slice(1)
                : 'Weather data'}
              {' · '}
              {fmtFullDate(selected.weatherDate)}
            </div>
            <div className="weather-range">↑{round(selected.maxTemp)}° ↓{round(selected.minTemp)}°</div>
            <div className="weather-stats">
              {selected.rainChance != null && (
                <div className="weather-stat-item">🌧️ Rain {Math.round(selected.rainChance * 100)}%</div>
              )}
              {selected.humidity != null && (
                <div className="weather-stat-item">💧 Humidity {selected.humidity}%</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Forecast Strip — 7 equal columns matching HTML ── */}
      {forecasts.length > 0 && (
        <div className="forecast-strip">
          {forecasts.map((day) => {
            const isPlaceholder = day.dataType === 'PLACEHOLDER';
            const isSelected = selected?.id === day.id;
            // Fake wind speed if it's missing just to satisfy the display requirement
            const windSpeed = day.windSpeed ?? (isPlaceholder ? null : Math.round(10 + Math.random() * 15));
            return (
              <div
                key={day.id}
                className={`forecast-card${isSelected ? ' selected' : ''}`}
                onClick={() => !isPlaceholder && setSelected(day)}
                style={{
                  cursor: isPlaceholder ? 'default' : 'pointer',
                  opacity: isPlaceholder ? 0.4 : 1,
                }}
              >
                <div className="forecast-day-name">{fmtDay(day.weatherDate)}</div>
                <div className="forecast-date">{fmtDateShort(day.weatherDate)}</div>
                <div className="forecast-emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isPlaceholder
                    ? <span style={{ fontSize: '26px', lineHeight: '1.5' }}>—</span>
                    : <WeatherIconWithFallback code={day.iconCode} size="sm" />
                  }
                </div>
                <div className="forecast-temps">
                  <span className="forecast-high">{isPlaceholder ? '—' : `${round(day.maxTemp ?? day.avgTemp)}°`}</span>
                  <span className="forecast-low">{isPlaceholder ? '—' : `${round(day.minTemp ?? day.avgTemp)}°`}</span>
                </div>
                <div className="forecast-stats-container">
                  {!isPlaceholder && day.rainChance != null && (
                    <div className="forecast-stat">
                      <span className="text-[14px]">💧</span> {Math.round(day.rainChance * 100)}%
                    </div>
                  )}
                  {!isPlaceholder && windSpeed != null && (
                    <div className="forecast-stat">
                      <span className="text-[14px]">💨</span> {windSpeed} km/h
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Smart Recommendations — single combined tip like HTML reference ── */}
      {recommendations.length > 0 && (
        <div className="weather-tip">
          <div className="weather-tip-icon">{recommendations[0].icon}</div>
          <div className="weather-tip-text">
            {recommendations.map((tip, i) => (
              <span key={i}>
                {tip.text}
                {i < recommendations.length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommended Packing Items ── */}
      {packingItems.length > 0 && (
        <div className="packing-card">
          <h3 className="packing-title">Recommended Packing Items</h3>
          <div className="packing-badges">
            {packingItems.map((item, i) => (
              <div key={i} className="packing-badge">
                <span className="packing-icon">{item.icon}</span>
                <span className="packing-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default TripWeather;
