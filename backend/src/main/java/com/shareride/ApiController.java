package com.shareride;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
class ApiController {
  private final ShareRideService s;

  record RegisterReq(@NotBlank String name, @NotBlank @Email String email, @NotBlank @Size(min = 8) String password) {
  }

  record LoginReq(@NotBlank String email, @NotBlank String password) {
  }

  record ProfileReq(@NotBlank String name, String phone, String bio, String preferences) {
  }

  record JourneyReq(@NotBlank String from, @NotBlank String to, String pickup, String drop, @NotNull LocalDate date,
      @NotBlank String time, @NotBlank String model, String vehicleType, @NotBlank String number,
      @Min(1) @Max(6) int seats, @Min(1) int contribution, @NotNull @DecimalMin("-90") @DecimalMax("90") Double fromLat,
      @NotNull @DecimalMin("-180") @DecimalMax("180") Double fromLng,
      @NotNull @DecimalMin("-90") @DecimalMax("90") Double toLat,
      @NotNull @DecimalMin("-180") @DecimalMax("180") Double toLng) {
  }

  record LocReq(@DecimalMin("-90") @DecimalMax("90") double lat, @DecimalMin("-180") @DecimalMax("180") double lng) {
  }

  record JoinReq(String message, @NotBlank String pickupName,
      @NotNull @DecimalMin("-90") @DecimalMax("90") Double pickupLat,
      @NotNull @DecimalMin("-180") @DecimalMax("180") Double pickupLng, @NotBlank String dropName,
      @NotNull @DecimalMin("-90") @DecimalMax("90") Double dropLat,
      @NotNull @DecimalMin("-180") @DecimalMax("180") Double dropLng) {
  }

  record TextReq(String text) {
  }

  @PostMapping("/auth/register")
  Map<String, Object> register(@Valid @RequestBody RegisterReq r) {
    return s.register(r.name(), r.email(), r.password());
  }

  @PostMapping("/auth/login")
  Map<String, Object> login(@Valid @RequestBody LoginReq r) {
    return s.login(r.email(), r.password());
  }

  @GetMapping("/users/me")
  AppUser me(@AuthenticationPrincipal Long uid) {
    return s.me(uid);
  }

  @PutMapping("/users/me")
  AppUser update(@AuthenticationPrincipal Long uid, @Valid @RequestBody ProfileReq r) {
    return s.updateProfile(uid, r.name(), r.phone(), r.bio(), r.preferences());
  }

  @GetMapping("/journeys")
  List<Journey> search(@RequestParam(required = false) String from, @RequestParam(required = false) String to,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
      @RequestParam(defaultValue = "1") int seats,
      @RequestParam(defaultValue = "0") int maxPrice, @RequestParam(defaultValue = "recommended") String sort) {
    return s.search(from, to, date, seats, maxPrice, sort);
  }

  @GetMapping("/journeys/mine")
  List<Journey> mine(@AuthenticationPrincipal Long uid) {
    return s.mine(uid);
  }

  @GetMapping("/journeys/{id}")
  Journey get(@PathVariable Long id) {
    return s.get(id);
  }

  @PostMapping("/journeys")
  Journey create(@AuthenticationPrincipal Long uid, @Valid @RequestBody JourneyReq r) {
    return s.create(uid, r.from(), r.to(), r.pickup(), r.drop(), r.date(), r.time(), r.model(), r.vehicleType(),
        r.number(), r.seats(), r.contribution(), r.fromLat(), r.fromLng(), r.toLat(), r.toLng());
  }

  @PostMapping("/journeys/{id}/join")
  Journey join(@AuthenticationPrincipal Long uid, @PathVariable Long id, @Valid @RequestBody JoinReq r) {
    return s.join(uid, id, r.message(), r.pickupName(), r.pickupLat(), r.pickupLng(), r.dropName(), r.dropLat(),
        r.dropLng());
  }

  @PostMapping("/journeys/{id}/start")
  Journey start(@AuthenticationPrincipal Long uid, @PathVariable Long id) {
    return s.start(uid, id);
  }

  @PostMapping("/journeys/{id}/location")
  void location(@AuthenticationPrincipal Long uid, @PathVariable Long id, @Valid @RequestBody LocReq r) {
    s.updateLocation(uid, id, r.lat(), r.lng());
  }

  @GetMapping("/journeys/{id}/location")
  Map<String, Object> live(@AuthenticationPrincipal Long uid, @PathVariable Long id) {
    return s.liveLocation(uid, id);
  }

  @GetMapping("/journeys/{id}/stops")
  List<Map<String, Object>> stops(@AuthenticationPrincipal Long uid, @PathVariable Long id) {
    return s.stops(uid, id);
  }

  @PostMapping("/journeys/{id}/passengers/{userId}/pickup")
  void pickUp(@AuthenticationPrincipal Long uid, @PathVariable Long id, @PathVariable Long userId) {
    s.pickUp(uid, id, userId);
  }

  @PostMapping("/journeys/{id}/passengers/{userId}/dropoff") void dropOff(@AuthenticationPrincipal Long uid,@PathVariable Long id,@PathVariable Long userId){s.dropOff(uid,id,userId);}
  @PostMapping("/journeys/{id}/complete") Journey complete(@AuthenticationPrincipal Long uid,@PathVariable Long id){return s.complete(uid,id);}

  @GetMapping("/conversations")
  List<ShareRideService.ConvView> conversations(@AuthenticationPrincipal Long uid) {
    return s.conversations(uid);
  }

  @PostMapping("/conversations/{id}/messages")
  Message send(@AuthenticationPrincipal Long uid, @PathVariable Long id, @RequestBody TextReq r) {
    return s.send(uid, id, r.text());
  }

  @GetMapping("/notifications")
  List<Notification> notifications(@AuthenticationPrincipal Long uid) {
    return s.notifications(uid);
  }

  @GetMapping("/notifications/unread-count")
  Map<String, Long> unread(@AuthenticationPrincipal Long uid) {
    return Map.of("count", s.unread(uid));
  }

  @PostMapping("/notifications/read-all")
  void readAll(@AuthenticationPrincipal Long uid) {
    s.readAll(uid);
  }
}
