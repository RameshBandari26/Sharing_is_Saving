package com.shareride;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.*;
import java.time.*;
import java.util.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Journey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long hostId;
    @JsonProperty("from")
    @Column(name = "from_city")
    private String origin;
    @JsonProperty("to")
    @Column(name = "to_city")
    private String destination;
    private String pickup;
    @JsonProperty("drop")
    @Column(name = "drop_point")
    private String dropPoint;
    @JsonProperty("date")
    @Column(name = "travel_date")
    private LocalDate travelDate;
    private String departureTime, duration, vehicleModel, vehicleType, vehicleNumber;
    private int seatsTotal, seatsAvailable, contribution;
    private String status = "UPCOMING";
    private Long startedAt;
    private boolean verified;
    private Instant createdAt = Instant.now();
    @Column(columnDefinition = "DECIMAL(10,7)")
    private Double fromLat, fromLng, toLat, toLng;
    @JsonIgnore
    @Column(columnDefinition = "DECIMAL(10,7)")
    private Double liveLat, liveLng;
    @JsonIgnore
    private Long liveAt;
    @Transient
    private AppUser host;
    @Transient
    private List<Long> passengerIds = List.of();
}
