package com.shareride;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class ShareRideService {
  private final UserRepo users;
  private final JourneyRepo journeys;
  private final PassengerRepo passengers;
  private final ConversationRepo convs;
  private final MessageRepo msgs;
  private final NotificationRepo notes;
  private final JwtService jwt;
  private final PasswordEncoder enc;

  public record ConvView(Long id, Long journeyId, List<Long> participants, List<Message> messages) {
  }

  static ResponseStatusException bad(String m) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, m);
  }

  // ---- auth & profile ----
  Map<String, Object> auth(AppUser u) {
    return Map.of("token", jwt.create(u.getId()), "user", u);
  }

  public Map<String, Object> register(String name, String email, String pw) {
    if (users.findByEmail(email.trim().toLowerCase()).isPresent())
      throw bad("Email already registered");
    AppUser u = new AppUser();
    u.setName(name.trim());
    u.setEmail(email.trim().toLowerCase());
    u.setPasswordHash(enc.encode(pw));
    u.setAvatar("https://api.dicebear.com/9.x/initials/svg?seed=" + URLEncoder.encode(name, StandardCharsets.UTF_8));
    u.setMemberSince(String.valueOf(Year.now().getValue()));
    u.setBio("New to ShareRide.");
    return auth(users.save(u));
  }

  public Map<String, Object> login(String email, String pw) {
    return auth(users.findByEmail(email.trim().toLowerCase()).filter(x -> enc.matches(pw, x.getPasswordHash()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password")));
  }

  public AppUser me(Long uid) {
    return users.findById(uid).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
  }

  public AppUser updateProfile(Long uid, String name, String phone, String bio, String prefs) {
    AppUser u = me(uid);
    u.setName(name.trim());
    u.setPhone(phone);
    u.setBio(bio);
    u.setPreferences(prefs);
    return users.save(u);
  }

  // ---- journeys ----
  Journey view(Journey j) {
    j.setHost(users.findById(j.getHostId()).orElse(null));
    j.setPassengerIds(passengers.findByJourneyId(j.getId()).stream().map(Passenger::getUserId).toList());
    return j;
  }

  private double rating(Long id) {
    return users.findById(id).map(AppUser::getRating).orElse(0.0);
  }

  private static boolean has(String a, String b) {
    return b == null || b.isBlank() || a.toLowerCase().contains(b.trim().toLowerCase());
  }

  void notify(Long uid, String text, String link) {
    Notification n = new Notification();
    n.setUserId(uid);
    n.setText(text);
    n.setLink(link);
    notes.save(n);
  }

  @Transactional(readOnly = true)
  public List<Journey> search(String from, String to, LocalDate date, int seats, int max, String sort) {
    Comparator<Journey> c = switch (sort == null ? "" : sort) {
      case "lowest" -> Comparator.comparingInt(Journey::getContribution);
      case "rated" -> Comparator.comparingDouble((Journey j) -> -rating(j.getHostId()));
      default -> Comparator.comparing(Journey::getTravelDate).thenComparing(Journey::getDepartureTime);
    };
    return journeys.findAll().stream()
            .filter(j -> !List.of("CANCELLED", "COMPLETED", "STARTED").contains(j.getStatus()))
            .filter(j -> has(j.getOrigin(), from) && has(j.getDestination(), to)
                    && (date == null || date.equals(j.getTravelDate())) && (max == 0 || j.getContribution() <= max)
                    && (j.getSeatsAvailable() >= seats || "FULL".equals(j.getStatus())))
            .sorted(c).map(this::view).toList();
  }

  @Transactional(readOnly = true)
  public Journey get(Long id) {
    return view(journeys.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found")));
  }

  @Transactional(readOnly = true)
  public List<Journey> mine(Long uid) {
    Set<Long> ids = new LinkedHashSet<>();
    journeys.findByHostId(uid).forEach(j -> ids.add(j.getId()));
    passengers.findByUserId(uid).forEach(p -> ids.add(p.getJourneyId()));
    return journeys.findAllById(ids).stream().map(this::view).toList();
  }

  public Journey create(Long uid, String from, String to, String pickup, String drop, LocalDate date, String time,
                        String model, String type, String number, int seats, int contribution, Double fLat, Double fLng, Double tLat,
                        Double tLng) {
    if (from.trim().equalsIgnoreCase(to.trim()))
      throw bad("Destination must differ from origin");
    Journey j = new Journey();
    j.setHostId(uid);
    j.setOrigin(from.trim());
    j.setDestination(to.trim());
    j.setPickup(pickup == null ? from : pickup);
    j.setDropPoint(drop == null ? to : drop);
    j.setTravelDate(date);
    j.setDepartureTime(time);
    j.setDuration("—");
    j.setVehicleModel(model);
    j.setVehicleType(type);
    j.setVehicleNumber(number);
    j.setSeatsTotal(seats);
    j.setSeatsAvailable(seats);
    j.setContribution(contribution);
    j.setFromLat(fLat);
    j.setFromLng(fLng);
    j.setToLat(tLat);
    j.setToLng(tLng);
    j.setVerified(me(uid).isVerified());
    Journey s = journeys.save(j);
    notify(uid, "Your journey " + from + " → " + to + " is published.", "/journey/" + s.getId());
    return view(s);
  }

  public Journey join(Long uid, Long id, String message, String pn, Double pla, Double plo, String dn, Double dla,
                      Double dlo) {
    Journey j = journeys.lockById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found"));
    switch (j.getStatus()) {
      case "CANCELLED" -> throw bad("This journey was cancelled");
      case "COMPLETED" -> throw bad("This journey is completed");
      case "STARTED" -> throw bad("This journey has already started");
      default -> {
      }
    }
    if (j.getHostId().equals(uid))
      throw bad("You are the host of this journey");
    if (passengers.existsByJourneyIdAndUserId(id, uid))
      throw bad("You have already joined this journey");
    if (j.getSeatsAvailable() < 1)
      throw bad("Journey is full");
    Passenger p = new Passenger();
    p.setJourneyId(id);
    p.setUserId(uid);
    p.setPickupName(pn);
    p.setPickupLat(pla);
    p.setPickupLng(plo);
    p.setDropName(dn);
    p.setDropLat(dla);
    p.setDropLng(dlo);
    passengers.save(p);
    j.setSeatsAvailable(j.getSeatsAvailable() - 1);
    if (j.getSeatsAvailable() == 0)
      j.setStatus("FULL");
    journeys.save(j);
    Conversation c = new Conversation();
    c.setJourneyId(id);
    c.setHostId(j.getHostId());
    c.setPassengerId(uid);
    convs.save(c);
    Message m = new Message();
    m.setConversationId(c.getId());
    m.setSenderId(uid);
    m.setText(message == null || message.isBlank() ? "Hi, I'd like to join your journey." : message);
    msgs.save(m);
    String r = j.getOrigin() + " → " + j.getDestination();
    notify(j.getHostId(), me(uid).getName() + " joined your journey " + r + ".", "/journey/" + id);
    notify(uid, "You joined " + r + ".", "/journey/" + id);
    return view(j);
  }

  public Journey start(Long uid, Long id) {
    Journey j = journeys.lockById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found"));
    if (!j.getHostId().equals(uid))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the host can start this journey");
    if (List.of("STARTED", "CANCELLED", "COMPLETED").contains(j.getStatus()))
      throw bad("This journey cannot be started");
    j.setStatus("STARTED");
    j.setStartedAt(System.currentTimeMillis());
    journeys.save(j);
    passengers.findByJourneyId(id).forEach(p -> notify(p.getUserId(),
            "Vehicle started: " + j.getOrigin() + " → " + j.getDestination() + ". Track it live.", "/track/" + id));
    return view(j);
  }

  // ---- live location (host -> joined passengers) ----
  private Journey find(Long id) {
    return journeys.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Journey not found"));
  }

  public void updateLocation(Long uid, Long id, double lat, double lng) {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
      throw bad("Invalid coordinates");
    Journey j = find(id);
    if (!j.getHostId().equals(uid))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the host can share location");
    if (!"STARTED".equals(j.getStatus()))
      throw bad("Journey has not started");
    j.setLiveLat(lat);
    j.setLiveLng(lng);
    j.setLiveAt(System.currentTimeMillis());
    journeys.save(j);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> liveLocation(Long uid, Long id) {
    Journey j = find(id);
    if (!j.getHostId().equals(uid) && !passengers.existsByJourneyIdAndUserId(id, uid))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not part of this journey");
    Map<String, Object> m = new HashMap<>();
    m.put("status", j.getStatus());
    m.put("lat", j.getLiveLat());
    m.put("lng", j.getLiveLng());
    m.put("at", j.getLiveAt());
    return m;
  }

  // ---- passenger stops & pickup ----
  private static Map<String, Object> stop(String n, Double la, Double lo) {
    Map<String, Object> m = new HashMap<>();
    m.put("name", n);
    m.put("lat", la);
    m.put("lng", lo);
    return m;
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> stops(Long uid, Long id) {
    Journey j = find(id);
    boolean host = j.getHostId().equals(uid);
    if (!host && !passengers.existsByJourneyIdAndUserId(id, uid))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not part of this journey");
    return passengers.findByJourneyId(id).stream().filter(p -> host || p.getUserId().equals(uid)).map(p -> {
      Map<String, Object> m = new HashMap<>();
      m.put("userId", p.getUserId());
      m.put("name", users.findById(p.getUserId()).map(AppUser::getName).orElse("Passenger"));
      m.put("status", p.getStatus() == null ? "WAITING" : p.getStatus());
      m.put("pickup", stop(p.getPickupName(), p.getPickupLat(), p.getPickupLng()));
      m.put("drop", stop(p.getDropName(), p.getDropLat(), p.getDropLng()));
      return m;
    }).toList();
  }

  public void pickUp(Long uid, Long id, Long passengerId) {
    Journey j = find(id);
    if (!j.getHostId().equals(uid))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the host can do this");
    if (!"STARTED".equals(j.getStatus()))
      throw bad("Journey has not started");
    Passenger p = passengers.findByJourneyId(id).stream().filter(x -> x.getUserId().equals(passengerId)).findFirst()
            .orElseThrow(() -> bad("Passenger not found"));
    p.setStatus("PICKED_UP");
    passengers.save(p);
    notify(passengerId, "You've been picked up. Heading to your drop location.", "/track/" + id);
  }

  // ---- messages ----
  @Transactional(readOnly = true)
  public List<ConvView> conversations(Long uid) {
    return convs.findByHostIdOrPassengerIdOrderByUpdatedAtDesc(uid, uid).stream()
            .map(c -> new ConvView(c.getId(), c.getJourneyId(), List.of(c.getHostId(), c.getPassengerId()),
                    msgs.findByConversationIdOrderByAt(c.getId())))
            .toList();
  }

  public Message send(Long uid, Long cid, String text) {
    Conversation c = convs.findById(cid)
            .filter(x -> x.getHostId().equals(uid) || x.getPassengerId().equals(uid))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
    if (text == null || text.isBlank())
      throw bad("Message cannot be empty");
    Message m = new Message();
    m.setConversationId(cid);
    m.setSenderId(uid);
    m.setText(text.trim());
    c.setUpdatedAt(Instant.now());
    convs.save(c);
    Long other = c.getHostId().equals(uid) ? c.getPassengerId() : c.getHostId();
    notify(other, "New message from " + me(uid).getName(), "/messages");
    return msgs.save(m);
  }

  // ---- notifications ----
  @Transactional(readOnly = true)
  public List<Notification> notifications(Long uid) {
    return notes.findByUserIdOrderByAtDesc(uid);
  }

  @Transactional(readOnly = true)
  public long unread(Long uid) {
    return notes.countByUserIdAndReadFalse(uid);
  }

  public void readAll(Long uid) {
    List<Notification> l = notes.findByUserIdOrderByAtDesc(uid);
    l.forEach(n -> n.setRead(true));
    notes.saveAll(l);
  }
}