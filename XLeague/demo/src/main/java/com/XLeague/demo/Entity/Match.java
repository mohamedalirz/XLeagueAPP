package com.XLeague.demo.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_a_id")
    private Team teamA;

    @ManyToOne
    @JoinColumn(name = "team_b_id")
    private Team teamB;

    private int scoreA = 0;
    private int scoreB = 0;
    private boolean played = false;
    private LocalDateTime matchTime;
    private int round;

    @ManyToOne
    @JoinColumn(name = "league_id")
    @JsonIgnore
    private League league;
}