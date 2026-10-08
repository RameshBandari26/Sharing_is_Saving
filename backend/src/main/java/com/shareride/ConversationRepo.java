package com.shareride;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;

public interface ConversationRepo extends JpaRepository<Conversation, Long> {
    List<Conversation> findByHostIdOrPassengerIdOrderByUpdatedAtDesc(Long h, Long p);
}
