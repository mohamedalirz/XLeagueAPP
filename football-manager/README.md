# ⚽ FieldOps — Football Manager

A multiplayer football manager game frontend built with React.

## Tech Stack

- React 18 (Create React App)
- React Router DOM v6
- Axios
- Custom CSS (dark gaming theme)

## Setup

```bash
npm install
npm start
```

App runs at `http://localhost:3000`

## Backend

Expects a REST API at `http://localhost:8080/api` with:

| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| POST   | /leagues/create   | Create a new league |
| POST   | /leagues/join     | Join with a code   |
| GET    | /leagues/:id      | Get league data    |
| POST   | /matches/play     | Simulate a match   |

### Request / Response Examples

**POST /leagues/create**
```json
// Request
{ "username": "manager", "leagueName": "Premier", "teamName": "Iron City FC" }

// Response
{
  "leagueCode": "ABC123",
  "league": { "id": "1", "leagueName": "Premier", "code": "ABC123" },
  "team": { "id": "t1", "teamName": "Iron City FC" }
}
```

**POST /leagues/join**
```json
// Request
{ "username": "manager2", "leagueCode": "ABC123", "teamName": "Storm FC" }

// Response
{
  "league": { "id": "1", "leagueName": "Premier", "code": "ABC123" },
  "team": { "id": "t2", "teamName": "Storm FC" }
}
```

**GET /leagues/:id**
```json
{
  "league": { "id": "1", "leagueName": "Premier", "code": "ABC123" },
  "teams": [
    {
      "id": "t1",
      "teamName": "Iron City FC",
      "managerName": "manager",
      "wins": 3, "draws": 1, "losses": 0,
      "points": 10,
      "goalsFor": 8, "goalsAgainst": 2,
      "form": ["W","W","D","W","W"],
      "players": [
        { "id": "p1", "name": "Marco Rossi", "position": "GK", "power": 78, "xp": 420, "number": 1 }
      ]
    }
  ]
}
```

**POST /matches/play**
```json
// Request
{ "leagueId": "1", "teamId": "t1", "teamName": "Iron City FC" }

// Response
{
  "match": {
    "homeTeam": "Iron City FC",
    "awayTeam": "Storm FC",
    "homeScore": 2,
    "awayScore": 1,
    "winner": "Iron City FC",
    "round": 4,
    "events": [
      { "minute": 23, "type": "goal", "player": "Marco Rossi", "team": "Iron City FC" },
      { "minute": 67, "type": "goal", "player": "Pierre Dubois", "team": "Storm FC" },
      { "minute": 88, "type": "goal", "player": "Carlos Vega", "team": "Iron City FC" }
    ]
  }
}
```

## Project Structure

```
src/
├── api/
│   └── api.js              # Axios client + endpoint functions
├── components/
│   ├── Navbar.js            # Navigation bar
│   ├── TeamCard.js          # Team summary card
│   ├── PlayerCard.js        # Player stat card
│   ├── LeagueTable.js       # Sortable standings table
│   └── MatchCard.js         # Match result display
├── pages/
│   ├── Home.js              # Landing page
│   ├── CreateLeague.js      # Create league form
│   ├── JoinLeague.js        # Join with code form
│   ├── Dashboard.js         # League overview
│   ├── Team.js              # Squad management
│   ├── Match.js             # Play & view matches
│   └── League.js            # Full league table + stats
├── styles/
│   └── main.css             # All styling
├── App.js                   # Routes + layout
└── index.js                 # Entry point
```

## State Management

- League data: `localStorage.fm_league`
- Team data: `localStorage.fm_team`
- Match history: `localStorage.fm_match_history`
