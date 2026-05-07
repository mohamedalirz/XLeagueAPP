import React, { useState } from 'react';

const PlayerCard = ({ player, onTransfer }) => {
  const [showTransfer, setShowTransfer] = useState(false);
  const [price, setPrice] = useState(player?.value || 50000);

  // Safely access player properties
  if (!player) {
    return null;
  }

  const getPowerColor = (power) => {
    if (power >= 85) return 'text-purple-400';
    if (power >= 70) return 'text-neon-green';
    if (power >= 50) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const calculateXPPercent = () => {
    const xp = player.xp || 0;
    return (xp % 1000) / 10;
  };

  return (
    <div className="card-gradient rounded-xl p-4 neon-border hover:transform hover:scale-105 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-white">{player.name || 'Unknown Player'}</h3>
          <p className="text-sm text-gray-400">Position: {player.position || 'Midfielder'}</p>
        </div>
        <div className={`text-2xl font-bold ${getPowerColor(player.power || 50)}`}>
          {player.power || 50}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">XP Progress</span>
          <span className="text-neon-green">{player.xp || 0} XP</span>
        </div>
        <div className="w-full bg-dark-surface rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-neon-green to-green-400 h-full transition-all duration-500"
            style={{ width: `${calculateXPPercent()}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-gray-400">Age:</span>
          <span className="ml-2 text-white">{player.age || 22}</span>
        </div>
        <div>
          <span className="text-gray-400">Value:</span>
          <span className="ml-2 text-neon-green">${(player.value || 50000).toLocaleString()}</span>
        </div>
      </div>

      {onTransfer && !showTransfer && (
        <button
          onClick={() => setShowTransfer(true)}
          className="w-full bg-blue-600/20 text-blue-400 py-2 rounded-lg hover:bg-blue-600/30 transition-all duration-300"
        >
          List for Transfer
        </button>
      )}

      {showTransfer && (
        <div className="space-y-2">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-3 py-1 bg-dark-surface border border-gray-700 rounded text-sm"
            placeholder="Price"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onTransfer(price);
                setShowTransfer(false);
              }}
              className="flex-1 bg-neon-green text-dark-bg py-1 rounded text-sm font-semibold"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowTransfer(false)}
              className="flex-1 bg-gray-700 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;