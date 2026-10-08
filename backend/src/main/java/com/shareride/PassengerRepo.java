package com.shareride;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;

public interface PassengerRepo extends JpaRepository<Passenger, Long> {
    boolean existsByJourneyIdAndUserId(Long j, Long u);

    List<Passenger> findByJourneyId(Long j);

    List<Passenger> findByUserId(Long u);
}
