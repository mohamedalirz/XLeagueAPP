import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Transfers = () => {
  const { user } = useAuth();
  const [availableTransfers, setAvailableTransfers] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incomingOffers, setIncomingOffers] = useState([]); // Offers received by my team (to sell players)
  const [outgoingOffers, setOutgoingOffers] = useState([]); // Offers made by my team (to buy players)

  useEffect(() => {
    if (user?.username) {
      fetchTransferData();
      const interval = setInterval(fetchTransferData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchTransferData = async () => {
    try {
      // Fetch team info
      const teamRes = await axios.get('/teams/my-team', {
        params: { username: user.username }
      });
      setMyTeam(teamRes.data);
      
      // Fetch all transfers from the backend
      // You might need to create a new endpoint for this
      // For now, let's use available and my-offers
      
      // Available transfers (players listed for sale)
      const availableRes = await axios.get('/transfers/available');
      console.log('Available transfers:', availableRes.data);
      setAvailableTransfers(availableRes.data || []);
      
      // Offers where MY team is the SELLER (offers received for my players)
      const offersReceivedRes = await axios.get('/transfers/my-offers', {
        params: { username: user.username }
      });
      console.log('Offers received (someone wants my players):', offersReceivedRes.data);
      
      // Filter only PENDING offers (not SOLD or EXPIRED)
      const pendingIncoming = (offersReceivedRes.data || []).filter(
        offer => offer.status === 'PENDING'
      );
      setIncomingOffers(pendingIncoming);
      
      // For outgoing offers (offers I made to buy players), we need a separate endpoint
      // For now, let's filter available transfers that have toTeamId = myTeam.id and status = PENDING
      // You should create a /transfers/my-offers-made endpoint in the backend
      
      // Temporary: Filter from available? Actually offers I made are in the transfer table with toTeam = myTeam
      // We'll need a backend endpoint for this
      
    } catch (error) {
      console.error('Error fetching transfer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      console.log('Accepting offer:', offerId);
      const response = await axios.post(`/leagues/accept/${offerId}`);
      console.log('Accept response:', response.data);
      alert('Transfer accepted successfully!');
      
      // Refresh all data
      await fetchTransferData();
      
      // Refresh team data to update budget
      const teamRes = await axios.get('/teams/my-team', {
        params: { username: user.username }
      });
      setMyTeam(teamRes.data);
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('transfer-completed'));
      
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert(error.response?.data?.message || 'Failed to accept transfer');
    }
  };

  const handleMakeOffer = async (transferId, currentPrice, sellerTeamId) => {
    const price = prompt('Enter your offer price:', currentPrice);
    if (!price) return;
    
    const offerPrice = parseFloat(price);
    
    if (myTeam && myTeam.budget < offerPrice) {
      alert(`Insufficient budget! Your budget: $${myTeam.budget.toLocaleString()}`);
      return;
    }
    
    try {
      console.log('Making offer:', {
        transferId: transferId,
        toTeamId: myTeam.id,
        price: offerPrice
      });
      
      const response = await axios.post('/leagues/offer', {
        transferId: transferId,
        toTeamId: myTeam.id,
        price: offerPrice
      });
      
      console.log('Offer response:', response.data);
      alert('Transfer offer sent successfully!');
      fetchTransferData();
      
    } catch (error) {
      console.error('Error making offer:', error);
      alert(error.response?.data?.message || 'Failed to make transfer offer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">Transfer Market</h1>
        <p className="text-center text-gray-400">Buy and sell players</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Players (Listed for Sale) */}
        <div className="card-gradient rounded-2xl p-6 neon-border">
          <h2 className="text-2xl font-bold mb-4 text-neon-green">Available Players</h2>
          {availableTransfers.length > 0 ? (
            <div className="space-y-4">
              {availableTransfers.map(transfer => (
                <div key={transfer.id} className="bg-dark-surface rounded-lg p-4 hover:bg-dark-card-hover transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">
                        {transfer.player?.name || 'Unknown Player'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        From: {transfer.fromTeam?.name || 'Unknown Team'}
                      </p>
                      <p className="text-neon-green font-bold text-xl mt-2">
                        ${transfer.price?.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleMakeOffer(transfer.id, transfer.price, transfer.fromTeam?.id)}
                      className="bg-neon-green text-dark-bg px-4 py-2 rounded-lg font-semibold hover:bg-neon-green/80 transition"
                    >
                      Make Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No players currently available for transfer</p>
              <p className="text-sm text-gray-500 mt-2">List your players from the Team page!</p>
            </div>
          )}
        </div>

        {/* Incoming Offers (Offers Received for My Players) */}
        <div>
          <div className="card-gradient rounded-2xl p-6 neon-border">
            <h2 className="text-2xl font-bold mb-4 text-neon-green">Offers Received</h2>
            {incomingOffers.length > 0 ? (
              <div className="space-y-4">
                {incomingOffers.map(offer => (
                  <div key={offer.id} className="bg-dark-surface rounded-lg p-4">
                    <p className="font-semibold text-lg">{offer.player?.name || 'Unknown Player'}</p>
                    <p className="text-gray-400 text-sm">
                      From: {offer.toTeam?.name || 'Unknown Team'}
                    </p>
                    <p className="text-neon-green text-xl font-bold mt-2">
                      ${offer.price?.toLocaleString()}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        className="flex-1 bg-green-600/20 text-green-400 py-2 rounded-lg hover:bg-green-600/30 transition font-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => alert('Decline functionality coming soon')}
                        className="flex-1 bg-red-600/20 text-red-400 py-2 rounded-lg hover:bg-red-600/30 transition font-semibold"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No offers received</p>
                <p className="text-sm text-gray-500 mt-2">When someone offers to buy your players, they'll appear here</p>
              </div>
            )}
          </div>

          {/* Budget Info */}
          <div className="card-gradient rounded-2xl p-6 neon-border mt-6">
            <h3 className="text-lg font-bold mb-2">Your Budget</h3>
            <p className="text-3xl font-bold text-neon-green">
              ${myTeam?.budget?.toLocaleString() || '1,000,000'}
            </p>
            <p className="text-sm text-gray-400 mt-2">Available for transfers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfers;