import React from 'react';

const TEAM_EMOJIS = ['🦁', '🐯', '🦅', '🐺', '🦊', '🐉'];

const MatchCard = ({ match, myTeamName }) => {
  const {
    homeTeam = 'Home Team',
    awayTeam = 'Away Team',
    homeScore = 0,
    awayScore = 0,
    events = [],
    winner = null,
    round = null,
  } = match;

  const isHomeMe = homeTeam === myTeamName;
  const isAwayMe = awayTeam === myTeamName;

  let resultStatus = null;
  let resultLabel = '';

  if (myTeamName) {
    if (winner === null || homeScore === awayScore) {
      resultStatus = 'draw';
      resultLabel = 'Draw';
    } else if ((isHomeMe && homeScore > awayScore) || (isAwayMe && awayScore > homeScore)) {
      resultStatus = 'win';
      resultLabel = 'Victory!';
    } else {
      resultStatus = 'lose';
      resultLabel = 'Defeat';
    }
  }

  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;

  return (
    <div className="match-card animate-in">
      {/* Header */}
      <div className="match-card-header">
        <div className="match-card-label">Match Result</div>
        {round && (
          <div className="match-card-round">Round {round}</div>
        )}
      </div>

      {/* Teams & Score */}
      <div className="match-teams">
        {/* Home team */}
        <div className={`match-team${homeWon ? ' winner' : ''}`}>
          <div className="match-team-badge">
            {TEAM_EMOJIS[0]}
          </div>
          <div className="match-team-name">{homeTeam}</div>
          {homeWon && (
            <span className="badge badge-green" style={{ fontSize: 10 }}>
              Winner
            </span>
          )}
        </div>

        {/* Score */}
        <div className="match-score-display">
          <div className="match-score">
            {homeScore}
            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: 32,
                margin: '0 4px',
              }}
            >
              :
            </span>
            {awayScore}
          </div>
          <div className="match-vs">FT</div>
        </div>

        {/* Away team */}
        <div className={`match-team${awayWon ? ' winner' : ''}`}>
          <div className="match-team-badge">
            {TEAM_EMOJIS[1]}
          </div>
          <div className="match-team-name">{awayTeam}</div>
          {awayWon && (
            <span className="badge badge-green" style={{ fontSize: 10 }}>
              Winner
            </span>
          )}
        </div>
      </div>

      {/* My team result badge */}
      {resultStatus && (
        <div className={`match-status ${resultStatus}`}>
          {resultStatus === 'win' && '🏆 '}
          {resultStatus === 'draw' && '🤝 '}
          {resultStatus === 'lose' && '😔 '}
          {resultLabel}
        </div>
      )}

      {/* Events */}
      {events && events.length > 0 && (
        <div className="match-events">
          {events.slice(0, 8).map((event, i) => (
            <div className="match-event" key={i}>
              <span className="match-event-time">{event.minute || '?'}'</span>
              <span className="match-event-icon">
                {event.type === 'goal'
                  ? '⚽'
                  : event.type === 'yellow'
                  ? '🟨'
                  : event.type === 'red'
                  ? '🟥'
                  : event.type === 'sub'
                  ? '🔄'
                  : '📋'}
              </span>
              <span>{event.player || event.description || 'Event'}</span>
              {event.team && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                  }}
                >
                  {event.team}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchCard;
