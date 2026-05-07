package com.XLeague.demo.Repository;

import com.XLeague.demo.Entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByPlayedFalse();
    List<Match> findByPlayedTrue();

    @Query("SELECT m FROM Match m WHERE m.league.id = :leagueId ORDER BY m.round ASC, m.id ASC")
    List<Match> findByLeagueId(@Param("leagueId") Long leagueId);

    @Query("SELECT m FROM Match m WHERE m.league.id = :leagueId AND m.matchTime < :time ORDER BY m.round ASC")
    List<Match> findByLeagueIdAndMatchTimeBefore(@Param("leagueId") Long leagueId, @Param("time") LocalDateTime time);

    @Query("SELECT m FROM Match m WHERE m.matchTime < :time")
    List<Match> findByMatchTimeBefore(@Param("time") LocalDateTime time);

    @Query("SELECT m FROM Match m WHERE m.played = false AND m.matchTime > :time ORDER BY m.matchTime ASC")
    List<Match> findUpcomingMatches(@Param("time") LocalDateTime time);
}