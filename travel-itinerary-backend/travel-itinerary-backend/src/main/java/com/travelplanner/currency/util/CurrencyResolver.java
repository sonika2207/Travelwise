package com.travelplanner.currency.util;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Resolves a currency code from a country name or a known city/region name.
 * Falls back to a user-provided currency if no mapping is found (no exceptions thrown).
 */
@Component
public class CurrencyResolver {

    /** Maps country name (UPPER) -> ISO 4217 currency code */
    private static final Map<String, String> COUNTRY_TO_CURRENCY = new HashMap<>();

    /**
     * Maps well-known city / region / province names (UPPER) -> country name (UPPER),
     * so that e.g. "Bali" -> "INDONESIA" -> "IDR".
     */
    private static final Map<String, String> CITY_TO_COUNTRY = new HashMap<>();

    static {
        // â”€â”€ Asia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        COUNTRY_TO_CURRENCY.put("INDIA", "INR");
        COUNTRY_TO_CURRENCY.put("INDONESIA", "IDR");
        COUNTRY_TO_CURRENCY.put("JAPAN", "JPY");
        COUNTRY_TO_CURRENCY.put("CHINA", "CNY");
        COUNTRY_TO_CURRENCY.put("SOUTH KOREA", "KRW");
        COUNTRY_TO_CURRENCY.put("KOREA", "KRW");
        COUNTRY_TO_CURRENCY.put("SINGAPORE", "SGD");
        COUNTRY_TO_CURRENCY.put("THAILAND", "THB");
        COUNTRY_TO_CURRENCY.put("VIETNAM", "VND");
        COUNTRY_TO_CURRENCY.put("MALAYSIA", "MYR");
        COUNTRY_TO_CURRENCY.put("PHILIPPINES", "PHP");
        COUNTRY_TO_CURRENCY.put("CAMBODIA", "KHR");
        COUNTRY_TO_CURRENCY.put("MYANMAR", "MMK");
        COUNTRY_TO_CURRENCY.put("SRI LANKA", "LKR");
        COUNTRY_TO_CURRENCY.put("NEPAL", "NPR");
        COUNTRY_TO_CURRENCY.put("BANGLADESH", "BDT");
        COUNTRY_TO_CURRENCY.put("PAKISTAN", "PKR");
        COUNTRY_TO_CURRENCY.put("HONG KONG", "HKD");
        COUNTRY_TO_CURRENCY.put("TAIWAN", "TWD");
        COUNTRY_TO_CURRENCY.put("MALDIVES", "MVR");

        // â”€â”€ Middle East â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        COUNTRY_TO_CURRENCY.put("UNITED ARAB EMIRATES", "AED");
        COUNTRY_TO_CURRENCY.put("UAE", "AED");
        COUNTRY_TO_CURRENCY.put("SAUDI ARABIA", "SAR");
        COUNTRY_TO_CURRENCY.put("QATAR", "QAR");
        COUNTRY_TO_CURRENCY.put("KUWAIT", "KWD");
        COUNTRY_TO_CURRENCY.put("BAHRAIN", "BHD");
        COUNTRY_TO_CURRENCY.put("OMAN", "OMR");
        COUNTRY_TO_CURRENCY.put("ISRAEL", "ILS");
        COUNTRY_TO_CURRENCY.put("TURKEY", "TRY");
        COUNTRY_TO_CURRENCY.put("TURKIYE", "TRY");
        COUNTRY_TO_CURRENCY.put("JORDAN", "JOD");

        // â”€â”€ Europe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        COUNTRY_TO_CURRENCY.put("UNITED KINGDOM", "GBP");
        COUNTRY_TO_CURRENCY.put("UK", "GBP");
        COUNTRY_TO_CURRENCY.put("GREAT BRITAIN", "GBP");
        COUNTRY_TO_CURRENCY.put("BRITAIN", "GBP");
        COUNTRY_TO_CURRENCY.put("ENGLAND", "GBP");
        COUNTRY_TO_CURRENCY.put("SCOTLAND", "GBP");
        COUNTRY_TO_CURRENCY.put("WALES", "GBP");
        COUNTRY_TO_CURRENCY.put("SWITZERLAND", "CHF");
        COUNTRY_TO_CURRENCY.put("NORWAY", "NOK");
        COUNTRY_TO_CURRENCY.put("SWEDEN", "SEK");
        COUNTRY_TO_CURRENCY.put("DENMARK", "DKK");
        COUNTRY_TO_CURRENCY.put("CZECH REPUBLIC", "CZK");
        COUNTRY_TO_CURRENCY.put("CZECHIA", "CZK");
        COUNTRY_TO_CURRENCY.put("POLAND", "PLN");
        COUNTRY_TO_CURRENCY.put("HUNGARY", "HUF");
        COUNTRY_TO_CURRENCY.put("ROMANIA", "RON");
        COUNTRY_TO_CURRENCY.put("RUSSIA", "RUB");
        COUNTRY_TO_CURRENCY.put("UKRAINE", "UAH");
        // Eurozone
        for (String c : new String[]{
            "FRANCE","GERMANY","ITALY","SPAIN","PORTUGAL","NETHERLANDS",
            "BELGIUM","GREECE","AUSTRIA","IRELAND","FINLAND","LUXEMBOURG",
            "SLOVENIA","SLOVAKIA","ESTONIA","LATVIA","LITHUANIA","CROATIA",
            "MALTA","CYPRUS"
        }) {
            COUNTRY_TO_CURRENCY.put(c, "EUR");
        }

        // â”€â”€ Americas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        COUNTRY_TO_CURRENCY.put("USA", "USD");
        COUNTRY_TO_CURRENCY.put("UNITED STATES", "USD");
        COUNTRY_TO_CURRENCY.put("UNITED STATES OF AMERICA", "USD");
        COUNTRY_TO_CURRENCY.put("US", "USD");
        COUNTRY_TO_CURRENCY.put("AMERICA", "USD");
        COUNTRY_TO_CURRENCY.put("CANADA", "CAD");
        COUNTRY_TO_CURRENCY.put("MEXICO", "MXN");
        COUNTRY_TO_CURRENCY.put("BRAZIL", "BRL");
        COUNTRY_TO_CURRENCY.put("ARGENTINA", "ARS");
        COUNTRY_TO_CURRENCY.put("CHILE", "CLP");
        COUNTRY_TO_CURRENCY.put("COLOMBIA", "COP");
        COUNTRY_TO_CURRENCY.put("PERU", "PEN");

        // â”€â”€ Oceania â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        COUNTRY_TO_CURRENCY.put("AUSTRALIA", "AUD");
        COUNTRY_TO_CURRENCY.put("NEW ZEALAND", "NZD");

        // â”€â”€ Africa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        COUNTRY_TO_CURRENCY.put("SOUTH AFRICA", "ZAR");
        COUNTRY_TO_CURRENCY.put("KENYA", "KES");
        COUNTRY_TO_CURRENCY.put("NIGERIA", "NGN");
        COUNTRY_TO_CURRENCY.put("EGYPT", "EGP");
        COUNTRY_TO_CURRENCY.put("MOROCCO", "MAD");
        COUNTRY_TO_CURRENCY.put("ETHIOPIA", "ETB");
        COUNTRY_TO_CURRENCY.put("TANZANIA", "TZS");
        COUNTRY_TO_CURRENCY.put("GHANA", "GHS");

        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // City / Province / Island mappings â†’ country (all UPPER)
        // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        // Indonesia (Bali is an island/province, not a country)
        for (String place : new String[]{
            "BALI","UBUD","SEMINYAK","KUTA","SANUR","CANGGU","ULUWATU",
            "NUSA DUA","LEGIAN","JIMBARAN","LOMBOK","JAKARTA","SURABAYA",
            "BANDUNG","YOGYAKARTA","JOGJA","MEDAN","SEMARANG","MAKASSAR",
            "GILI ISLANDS","FLORES","KOMODO","RAJA AMPAT"
        }) {
            CITY_TO_COUNTRY.put(place, "INDONESIA");
        }

        // India
        for (String place : new String[]{
            "MUMBAI","DELHI","NEW DELHI","BANGALORE","BENGALURU","HYDERABAD",
            "CHENNAI","KOLKATA","PUNE","JAIPUR","AHMEDABAD","SURAT","LUCKNOW",
            "GOA","AGRA","VARANASI","UDAIPUR","MANALI","SHIMLA","DARJEELING",
            "KOCHI","TRIVANDRUM","MYSORE","COIMBATORE","AMRITSAR","CHANDIGARH",
            "RAJASTHAN","KERALA","KARNATAKA","MAHARASHTRA","TAMIL NADU"
        }) {
            CITY_TO_COUNTRY.put(place, "INDIA");
        }

        // Japan
        for (String place : new String[]{
            "TOKYO","OSAKA","KYOTO","HIROSHIMA","NARA","SAPPORO","FUKUOKA",
            "NAGOYA","YOKOHAMA","KOBE","OKINAWA","HAKONE","NIKKO","KAMAKURA"
        }) {
            CITY_TO_COUNTRY.put(place, "JAPAN");
        }

        // Thailand
        for (String place : new String[]{
            "BANGKOK","PHUKET","CHIANG MAI","CHIANG RAI","PATTAYA","KO SAMUI",
            "KOH SAMUI","KO PHA-NGAN","KOH TAO","KRABI","HUA HIN","AYUTTHAYA",
            "KANCHANABURI","SUKHOTHAI"
        }) {
            CITY_TO_COUNTRY.put(place, "THAILAND");
        }

        // Vietnam
        for (String place : new String[]{
            "HANOI","HO CHI MINH","HO CHI MINH CITY","SAIGON","DA NANG","DANANG",
            "HOI AN","HUE","NHANH TRANG","PHU QUOC","HA LONG","HALONG"
        }) {
            CITY_TO_COUNTRY.put(place, "VIETNAM");
        }

        // UAE
        for (String place : new String[]{
            "DUBAI","ABU DHABI","SHARJAH","AJMAN","RAS AL KHAIMAH","FUJAIRAH"
        }) {
            CITY_TO_COUNTRY.put(place, "UAE");
        }

        // USA
        for (String place : new String[]{
            "NEW YORK","LOS ANGELES","CHICAGO","HOUSTON","PHOENIX","PHILADELPHIA",
            "SAN ANTONIO","SAN DIEGO","DALLAS","SAN JOSE","AUSTIN","JACKSONVILLE",
            "SAN FRANCISCO","SEATTLE","DENVER","NASHVILLE","MIAMI","BOSTON",
            "LAS VEGAS","ORLANDO","WASHINGTON DC","WASHINGTON","HAWAII","HONOLULU",
            "MANHATTAN","BROOKLYN","LOS ANGELES","NYC"
        }) {
            CITY_TO_COUNTRY.put(place, "USA");
        }

        // UK
        for (String place : new String[]{
            "LONDON","MANCHESTER","BIRMINGHAM","EDINBURGH","GLASGOW","LIVERPOOL",
            "LEEDS","BRISTOL","OXFORD","CAMBRIDGE","BATH","YORK","CARDIFF"
        }) {
            CITY_TO_COUNTRY.put(place, "UK");
        }

        // France
        for (String place : new String[]{
            "PARIS","NICE","LYON","MARSEILLE","BORDEAUX","STRASBOURG","TOULOUSE",
            "CANNES","MONACO","MONT SAINT-MICHEL","VERSAILLES"
        }) {
            CITY_TO_COUNTRY.put(place, "FRANCE");
        }

        // Italy
        for (String place : new String[]{
            "ROME","MILAN","VENICE","FLORENCE","NAPLES","TURIN","BOLOGNA",
            "PALERMO","SIENA","AMALFI","CINQUE TERRE","SICILY","SARDINIA"
        }) {
            CITY_TO_COUNTRY.put(place, "ITALY");
        }

        // Spain
        for (String place : new String[]{
            "MADRID","BARCELONA","SEVILLE","VALENCIA","BILBAO","GRANADA",
            "MALAGA","IBIZA","MALLORCA","TENERIFE","LANZAROTE"
        }) {
            CITY_TO_COUNTRY.put(place, "SPAIN");
        }

        // Germany
        for (String place : new String[]{
            "BERLIN","MUNICH","HAMBURG","FRANKFURT","COLOGNE","STUTTGART",
            "DUSSELDORF","DORTMUND","ESSEN","HEIDELBERG","ROTHENBURG"
        }) {
            CITY_TO_COUNTRY.put(place, "GERMANY");
        }

        // Singapore (also a city)
        CITY_TO_COUNTRY.put("SINGAPORE", "SINGAPORE");

        // Malaysia
        for (String place : new String[]{
            "KUALA LUMPUR","KL","PENANG","LANGKAWI","KOTA KINABALU","JOHOR BAHRU",
            "GEORGE TOWN","MALACCA","IPOH"
        }) {
            CITY_TO_COUNTRY.put(place, "MALAYSIA");
        }

        // Australia
        for (String place : new String[]{
            "SYDNEY","MELBOURNE","BRISBANE","PERTH","ADELAIDE","GOLD COAST",
            "CAIRNS","DARWIN","HOBART","CANBERRA"
        }) {
            CITY_TO_COUNTRY.put(place, "AUSTRALIA");
        }

        // Canada
        for (String place : new String[]{
            "TORONTO","VANCOUVER","MONTREAL","CALGARY","OTTAWA","EDMONTON",
            "QUEBEC","BANFF","WHISTLER","NIAGARA FALLS"
        }) {
            CITY_TO_COUNTRY.put(place, "CANADA");
        }

        // Maldives
        CITY_TO_COUNTRY.put("MALE", "MALDIVES");
        CITY_TO_COUNTRY.put("MAAFUSHI", "MALDIVES");

        // Sri Lanka
        for (String place : new String[]{
            "COLOMBO","KANDY","GALLE","ELLA","SIGIRIYA","NEGOMBO","TRINCOMALEE"
        }) {
            CITY_TO_COUNTRY.put(place, "SRI LANKA");
        }

        // Nepal
        for (String place : new String[]{
            "KATHMANDU","POKHARA","CHITWAN","BHAKTAPUR","EVEREST BASE CAMP"
        }) {
            CITY_TO_COUNTRY.put(place, "NEPAL");
        }

        // Turkey
        for (String place : new String[]{
            "ISTANBUL","ANKARA","IZMIR","ANTALYA","CAPPADOCIA","BODRUM","KUSADASI"
        }) {
            CITY_TO_COUNTRY.put(place, "TURKEY");
        }

        // Egypt
        for (String place : new String[]{
            "CAIRO","LUXOR","ASWAN","HURGHADA","SHARM EL SHEIKH","ALEXANDRIA"
        }) {
            CITY_TO_COUNTRY.put(place, "EGYPT");
        }

        // South Africa
        for (String place : new String[]{
            "CAPE TOWN","JOHANNESBURG","DURBAN","PRETORIA","PORT ELIZABETH",
            "STELLENBOSCH","KRUGER","SAFARI"
        }) {
            CITY_TO_COUNTRY.put(place, "SOUTH AFRICA");
        }

        // China
        for (String place : new String[]{
            "BEIJING","SHANGHAI","GUANGZHOU","SHENZHEN","CHENGDU","HANGZHOU",
            "XIAN","GUILIN","ZHANGJIAJIE","HONG KONG"
        }) {
            CITY_TO_COUNTRY.put(place, "CHINA");
        }

        // Philippines
        for (String place : new String[]{
            "MANILA","CEBU","BORACAY","PALAWAN","DAVAO","SIARGAO","BOHOL"
        }) {
            CITY_TO_COUNTRY.put(place, "PHILIPPINES");
        }

        // South Korea
        for (String place : new String[]{
            "SEOUL","BUSAN","INCHEON","JEJU","GYEONGJU","DAEJEON","DAEGU"
        }) {
            CITY_TO_COUNTRY.put(place, "SOUTH KOREA");
        }

        // Brazil
        for (String place : new String[]{
            "SAO PAULO","RIO DE JANEIRO","RIO","BRASILIA","SALVADOR","FORTALEZA",
            "MANAUS","IGUAZU"
        }) {
            CITY_TO_COUNTRY.put(place, "BRAZIL");
        }

        // Mexico
        for (String place : new String[]{
            "MEXICO CITY","CANCUN","GUADALAJARA","MONTERREY","PLAYA DEL CARMEN",
            "TULUM","CABO SAN LUCAS","OAXACA","PUERTO VALLARTA"
        }) {
            CITY_TO_COUNTRY.put(place, "MEXICO");
        }
    }

    /**
     * Resolve currency from a country or city/region name.
     * Priority:
     *   1. Direct country match
     *   2. City â†’ country â†’ currency lookup
     *   3. Return fallback (user-supplied) currency â€” NEVER throws
     *
     * @param location    destination country or city name
     * @param fallback    currency code supplied by the user (e.g. "USD")
     * @return ISO 4217 currency code
     */
    public String resolveCurrency(String location, String fallback) {
        if (location == null || location.trim().isEmpty()) {
            return (fallback != null && !fallback.isBlank()) ? fallback : "USD";
        }

        String normalized = location.trim().toUpperCase();

        // 1. Direct country lookup
        String currency = COUNTRY_TO_CURRENCY.get(normalized);
        if (currency != null) return currency;

        // 2. City â†’ country lookup
        String countryKey = CITY_TO_COUNTRY.get(normalized);
        if (countryKey != null) {
            currency = COUNTRY_TO_CURRENCY.get(countryKey);
            if (currency != null) return currency;
        }

        // 3. Graceful fallback â€” use user-supplied currency
        return (fallback != null && !fallback.isBlank()) ? fallback : "USD";
    }

    /**
     * Backward-compatible single-argument version â€” falls back to USD.
     */
    public String resolveCurrency(String location) {
        return resolveCurrency(location, "USD");
    }
}
