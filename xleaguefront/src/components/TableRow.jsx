import React from 'react';

const TableRow = ({ team, index }) => {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
      index % 2 === 0 ? 'bg-dark-surface/50' : 'bg-dark-card'
    } hover:bg-dark-card-hover`}>
      <div className="flex items-center space-x-4">
        <span className="text-2xl font-bold text-neon-green w-8">{index + 1}</span>
        <span className="font-semibold text-white">{team.name}</span>
      </div>
      <div className="flex space-x-6 text-center">
        <div className="min-w-[50px]">
          <span className="text-gray-400 text-sm">P</span>
          <p className="font-semibold">{team.wins + team.losses}</p>
        </div>
        <div className="min-w-[50px]">
          <span className="text-gray-400 text-sm">W</span>
          <p className="font-semibold text-green-400">{team.wins}</p>
        </div>
        <div className="min-w-[50px]">
          <span className="text-gray-400 text-sm">L</span>
          <p className="font-semibold text-red-400">{team.losses}</p>
        </div>
        <div className="min-w-[60px]">
          <span className="text-gray-400 text-sm">PTS</span>
          <p className="font-bold text-neon-green">{team.points}</p>
        </div>
      </div>
    </div>
  );
};

export default TableRow;