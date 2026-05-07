package com.XLeague.demo.Repository;

import com.XLeague.demo.Entity.League;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeagueRepository extends JpaRepository<League, Long> {
    Optional<League> findByCode(String code);
    Optional<League> findByTeams_User_Username(String username);
}