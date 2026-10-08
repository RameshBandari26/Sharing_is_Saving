package com.shareride;

import java.util.List;

/**
 * Swap the implementation (e.g. a paid geocoder) without touching controllers
 * or the frontend.
 */
public interface GeocodingService {
    record Place(String name, double lat, double lng) {
    }

    List<Place> search(String query);

    Place reverse(double lat, double lng);
}