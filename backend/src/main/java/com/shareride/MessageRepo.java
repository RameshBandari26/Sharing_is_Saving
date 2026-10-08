package com.shareride;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;

public interface MessageRepo extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByAt(Long c);
}
