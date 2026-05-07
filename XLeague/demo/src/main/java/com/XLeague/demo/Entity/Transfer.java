package com.XLeague.demo.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double price;

    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    private TransferStatus status;

    @ManyToOne
    @JoinColumn(name = "player_id")
    private Player player;

    @ManyToOne
    @JoinColumn(name = "from_team_id")
    private Team fromTeam;

    @ManyToOne
    @JoinColumn(name = "to_team_id")
    private Team toTeam;

    public enum TransferStatus {
        AVAILABLE, PENDING, SOLD, EXPIRED, CANCELLED
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            expiresAt = createdAt.plusDays(7);
        }
    }
}