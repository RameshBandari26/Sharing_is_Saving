package com.shareride;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
class NominatimGeocodingService implements GeocodingService {
  private static final Logger log = LoggerFactory.getLogger(NominatimGeocodingService.class);
  private final RestClient http;
  private final Map<String, List<Place>> cache = new ConcurrentHashMap<>();
  private long last = 0;

  NominatimGeocodingService(@Value("${geocoding.base-url:https://nominatim.openstreetmap.org}") String base) {
    SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
    f.setConnectTimeout(4000);
    f.setReadTimeout(8000);
    http = RestClient.builder().baseUrl(base).requestFactory(f)
        .defaultHeader("User-Agent", "ShareRide/0.1 (admin@shareride.example)").build();
  }

  /** Nominatim policy: max 1 request per second. */
  private synchronized void pace() {
    long w = last + 1100 - System.currentTimeMillis();
    if (w > 0) {
      try {
        Thread.sleep(w);
      } catch (InterruptedException ignored) {
      }
    }
    last = System.currentTimeMillis();
  }

  private List<Place> query(String q, boolean india) {
    pace();
    JsonNode n = http.get().uri(u -> {
      var b = u.path("/search").queryParam("q", q).queryParam("format", "jsonv2").queryParam("limit", 5);
      if (india)
        b.queryParam("countrycodes", "in");
      return b.build();
    }).retrieve().body(JsonNode.class);
    List<Place> r = new ArrayList<>();
    if (n != null)
      for (JsonNode x : n)
        r.add(new Place(x.path("display_name").asText(), x.path("lat").asDouble(), x.path("lon").asDouble()));
    return r;
  }

  @Override
  public List<Place> search(String q) {
    if (q == null || q.trim().length() < 3)
      return List.of();
    String k = q.trim().toLowerCase();
    List<Place> c = cache.get(k);
    if (c != null)
      return c;
    try {
      List<Place> r = query(q.trim(), true);
      if (r.isEmpty())
        r = query(q.trim(), false);
      if (cache.size() > 500)
        cache.clear();
      cache.put(k, r);
      return r;
    } catch (Exception e) {
      log.warn("Location search failed for '{}': {}", q, e.toString());
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Location search is unavailable right now");
    }
  }

  @Override
  public Place reverse(double lat, double lng) {
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coordinates");
    try {
      pace();
      JsonNode n = http.get().uri(u -> u.path("/reverse").queryParam("lat", lat).queryParam("lon", lng)
          .queryParam("format", "jsonv2").queryParam("zoom", 14).build()).retrieve().body(JsonNode.class);
      String dn = n == null ? "" : n.path("display_name").asText("");
      if (dn.isBlank())
        return new Place("My current location", lat, lng);
      String[] p = dn.split(", ");
      return new Place(String.join(", ", Arrays.copyOf(p, Math.min(3, p.length))), lat, lng);
    } catch (Exception e) {
      log.warn("Reverse geocoding failed: {}", e.toString());
      return new Place("My current location", lat, lng);
    }
  }
}