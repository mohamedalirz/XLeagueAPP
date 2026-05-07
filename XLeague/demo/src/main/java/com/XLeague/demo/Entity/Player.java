package com.XLeague.demo.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter @Setter
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int power = 70;
    private int xp = 0;
    private int value = 50000;
    private String position;
    private int matchesPlayed = 0;
    private int goals = 0;
    private int assists = 0;

    @Enumerated(EnumType.STRING)
    private PlayerStatus status = PlayerStatus.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "team_id")
    @JsonIgnore
    private Team team;

    public enum PlayerStatus {
        ACTIVE, ON_TRANSFER, INJURED, SUSPENDED
    }
}