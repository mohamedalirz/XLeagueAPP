package com.XLeague.demo.Service;

import com.XLeague.demo.Entity.Player;
import com.XLeague.demo.Entity.Team;
import com.XLeague.demo.Repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository repo;

    public List<Player> generatePlayers(Team team) {
        List<Player> players = new ArrayList<>();

        String[] firstNames = {"James", "John", "Robert", "Michael", "William", "David", "Richard",
                "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Paul",
                "Steven", "Andrew", "Kenneth", "Joshua", "Kevin", "Brian"};

        String[] lastNames = {"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
                "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
                "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"};

        String[] positions = {
                "Goalkeeper",
                "Defender", "Defender", "Defender", "Defender",
                "Midfielder", "Midfielder", "Midfielder", "Midfielder",
                "Forward", "Forward",
                "Defender", "Midfielder", "Forward",
                "Defender", "Midfielder", "Forward",
                "Defender", "Midfielder", "Forward",
                "Midfielder", "Forward"
        };

        for (int i = 0; i < 22; i++) {
            Player p = new Player();

            // Generate realistic names
            String firstName = firstNames[(int)(Math.random() * firstNames.length)];
            String lastName = lastNames[(int)(Math.random() * lastNames.length)];
            p.setName(firstName + " " + lastName);

            // Generate power between 50-95
            int power = 50 + (int)(Math.random() * 45);
            p.setPower(power);

            p.setXp(0);

            // Calculate value based on power
            int value = 50000 + (power * 5000);
            p.setValue(value);

            p.setPosition(positions[i]);
            p.setTeam(team);

            players.add(p);
        }

        return players;
    }

    @Transactional
    public List<Player> savePlayers(List<Player> players) {
        return repo.saveAll(players);
    }
}