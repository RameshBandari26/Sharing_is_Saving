package com.shareride;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = { "journeyId", "userId" }))
public class Passenger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long journeyId, userId;
    private int seats = 1;
    private String pickupName, dropName, status = "WAITING";
    @Column(columnDefinition = "DECIMAL(10,7)")
    private Double pickupLat, pickupLng, dropLat, dropLng;
}