package com.travelplanner.email.repository;

import com.travelplanner.email.entity.EmailLog;
import com.travelplanner.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {

    /**
     * Returns true if a successful email of the given type was already sent for this trip today.
     * Used by the scheduler to prevent duplicate sends on server restarts.
     */
    @Query("SELECT COUNT(e) > 0 FROM EmailLog e " +
           "WHERE e.trip = :trip AND e.emailType = :emailType " +
           "AND e.status = 'SUCCESS' AND e.sentAt >= :since")
    boolean existsSuccessfulEmailSince(@Param("trip") Trip trip,
                                       @Param("emailType") String emailType,
                                       @Param("since") LocalDateTime since);
}
