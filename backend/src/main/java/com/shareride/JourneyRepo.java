package com.shareride;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;

public interface JourneyRepo extends JpaRepository<Journey, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select j from Journey j where j.id=:id")
    Optional<Journey> lockById(@Param("id") Long id);

    List<Journey> findByHostId(Long hostId);
}
