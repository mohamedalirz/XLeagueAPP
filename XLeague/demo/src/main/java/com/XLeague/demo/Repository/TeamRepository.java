package com.XLeague.demo.Repository;

import com.XLeague.demo.Entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {

    Optional<Team> findByUser_Username(String username);
}