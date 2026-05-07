package com.XLeague.demo.Repository;

import com.XLeague.demo.Entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerRepository extends JpaRepository<Player, Long> {}