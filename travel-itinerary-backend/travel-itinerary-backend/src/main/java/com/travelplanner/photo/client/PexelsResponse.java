package com.travelplanner.photo.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class PexelsResponse {

    private List<Photo> photos;

    @Data
    public static class Photo {
        private String url;
        private String photographer;
        @JsonProperty("photographer_url")
        private String photographerUrl;
        private Src src;
    }

    @Data
    public static class Src {
        private String original;
        private String large;
        private String large2x;
        private String medium;
        private String small;
        private String portrait;
        private String landscape;
        private String tiny;
    }
}
