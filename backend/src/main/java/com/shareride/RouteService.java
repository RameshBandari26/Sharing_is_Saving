package com.shareride;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RouteService {
  public record Route(double distanceKm, long durationMinutes, List<double[]> geometry) {
  }

  private final RestClient http;
  private final Map<String, Route> cache = new ConcurrentHashMap<>();

  RouteService(@Value("${routing.base-url}") String base) {
    SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
    f.setConnectTimeout(5000);
    f.setReadTimeout(10000);
    http = RestClient.builder().baseUrl(base).requestFactory(f).build();
  }

  public Route route(double fLat, double fLng, double tLat, double tLng) {
    if (Math.abs(fLat) > 90 || Math.abs(tLat) > 90 || Math.abs(fLng) > 180 || Math.abs(tLng) > 180)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coordinates");
    String key = fLat + "," + fLng + ";" + tLat + "," + tLng;
    Route hit = cache.get(key);
    if (hit != null)
      return hit;
    try {
      JsonNode n = http.get()
          .uri("/route/v1/driving/{a},{b};{c},{d}?overview=full&geometries=geojson", fLng, fLat, tLng, tLat).retrieve()
          .body(JsonNode.class);
      if (n == null || !"Ok".equals(n.path("code").asText()) || n.path("routes").isEmpty())
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No route found");
      JsonNode r = n.path("routes").get(0);
      List<double[]> g = new ArrayList<>();
      for (JsonNode p : r.path("geometry").path("coordinates"))
        g.add(new double[] { p.get(1).asDouble(), p.get(0).asDouble() });
      if (g.isEmpty())
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No route found");
      Route out = new Route(Math.round(r.path("distance").asDouble() / 100) / 10.0,
          Math.round(r.path("duration").asDouble() / 60), g);
      if (cache.size() > 500)
        cache.clear();
      cache.put(key, out);
      return out;
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Routing service is unavailable right now");
    }
  }
}
