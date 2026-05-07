package com.XLeague.demo.Repository;

import com.XLeague.demo.Entity.Player;
import com.XLeague.demo.Entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {

    List<Transfer> findByStatus(Transfer.TransferStatus status);

    List<Transfer> findByFromTeam_User_Username(String username);

    @Query("SELECT t FROM Transfer t WHERE t.player.id = :playerId AND t.status = :status")
    List<Transfer> findByPlayerIdAndStatus(@Param("playerId") Long playerId, @Param("status") Transfer.TransferStatus status);

    @Query("SELECT t FROM Transfer t WHERE t.player = :player AND t.status = :status")
    List<Transfer> findByPlayerAndStatus(@Param("player") Player player, @Param("status") Transfer.TransferStatus status);

    @Query("SELECT t FROM Transfer t WHERE t.toTeam.user.username = :username AND t.status = :status")
    List<Transfer> findByToTeam_User_UsernameAndStatus(@Param("username") String username, @Param("status") Transfer.TransferStatus status);

    @Query("SELECT t FROM Transfer t WHERE t.toTeam.id = :teamId AND t.status = :status")
    List<Transfer> findByToTeamIdAndStatus(@Param("teamId") Long teamId, @Param("status") Transfer.TransferStatus status);
}