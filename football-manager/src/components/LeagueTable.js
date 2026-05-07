import React from 'react';

const FORM_OPTIONS = ['W', 'W', 'D', 'L', 'W'];

const LeagueTable = ({ teams = [], myTeamId = null }) => {
  const sorted = [...teams].sort((a, b) => {
    const pts = (b.points || 0) - (a.points || 0);
    if (pts !== 0) return pts;
    const goalDiff =
      (b.goalsFor || 0) -
      (b.goalsAgainst || 0) -
      ((a.goalsFor || 0) - (a.goalsAgainst || 0));
    return goalDiff;
  });

  if (!sorted.length) {
    return (
      <div className="league-table-wrap">
        <div className="league-table-header">
          <span style={{ fontSize: 16 }}>🏆</span>
          <span className="league-table-title">Standings</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">No standings yet</div>
          <div className="empty-state-desc">Play matches to see the table update</div>
        </div>
      </div>
    );
  }

  return (
    <div className="league-table-wrap">
      <div className="league-table-header">
        <span style={{ fontSize: 16 }}>🏆</span>
        <span className="league-table-title">League Standings</span>
      </div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Form</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, i) => {
              const rank = i + 1;
              const isMe = team.id === myTeamId || team.teamName === myTeamId;
              const gd = (team.goalsFor || 0) - (team.goalsAgainst || 0);
              const form = team.form || FORM_OPTIONS;

              return (
                <tr
                  key={team.id || i}
                  style={{
                    background: isMe ? 'rgba(0, 229, 255, 0.04)' : undefined,
                  }}
                >
                  <td>
                    <div
                      className={`rank-badge${rank <= 3 ? ` rank-${rank}` : ''}`}
                    >
                      {rank}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontWeight: isMe ? 700 : 500,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>
                        {['🦁', '🐯', '🦅', '🐺', '🦊', '🐉', '🦁', '🦂'][i % 8]}
                      </span>
                      {team.teamName}
                      {isMe && (
                        <span className="badge badge-cyan" style={{ fontSize: 9 }}>
                          YOU
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {(team.wins || 0) + (team.draws || 0) + (team.losses || 0)}
                  </td>
                  <td style={{ color: 'var(--neon-green)', fontWeight: 600 }}>
                    {team.wins || 0}
                  </td>
                  <td style={{ color: 'var(--neon-amber)' }}>{team.draws || 0}</td>
                  <td style={{ color: 'var(--neon-red)' }}>{team.losses || 0}</td>
                  <td>{team.goalsFor || 0}</td>
                  <td>{team.goalsAgainst || 0}</td>
                  <td
                    style={{
                      color: gd > 0 ? 'var(--neon-green)' : gd < 0 ? 'var(--neon-red)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {gd > 0 ? `+${gd}` : gd}
                  </td>
                  <td>
                    <div className="form-dots">
                      {(Array.isArray(form) ? form : []).slice(-5).map((f, j) => (
                        <div
                          key={j}
                          className={`form-dot ${f}`}
                          title={f === 'W' ? 'Win' : f === 'D' ? 'Draw' : 'Loss'}
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="pts-value">{team.points || 0}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueTable;
