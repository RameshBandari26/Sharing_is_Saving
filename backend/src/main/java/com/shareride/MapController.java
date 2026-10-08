package com.shareride;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
class MapController {
    private final GeocodingService geo;
    private final RouteService routes;

    @GetMapping("/locations/search")
    List<GeocodingService.Place> search(@RequestParam String q) {
        return geo.search(q);
    }

    @GetMapping("/locations/reverse")
    GeocodingService.Place reverse(@RequestParam double lat, @RequestParam double lng) {
        return geo.reverse(lat, lng);
    }

    @GetMapping("/routes")
    RouteService.Route route(@RequestParam double fromLat, @RequestParam double fromLng, @RequestParam double toLat,
            @RequestParam double toLng) {
        return routes.route(fromLat, fromLng, toLat, toLng);
    }
}