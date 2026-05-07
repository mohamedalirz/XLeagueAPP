package com.XLeague.demo.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int points = 0;
    private int wins = 0;
    private int losses = 0;
    private int matchesPlayed = 0;
    private double budget = 5000000; // Starting budget: 5 million

    @ManyToOne
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Player> players = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "league_id")
    @JsonIgnore
    private League league;
}