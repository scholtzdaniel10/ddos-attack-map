import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AttackContext = createContext();

const initialState = {
  attacks: [],
  stats: {
    totalAttacks: 0,
    activeAttacks: 0,
    countries: 0,
    avgThreat: 'Low'
  },
  threatCounts: {
    high: 0,
    medium: 0,
    low: 0
  },
  recentAttacks: [],
  topTargets: [],
  isConnected: false
};

function attackReducer(state, action) {
  switch (action.type) {
    case 'ADD_ATTACK':
      const newAttack = action.payload;
      const updatedAttacks = [...state.attacks, newAttack].slice(-200); // Keep last 200 attacks for high activity
      
      // Update recent attacks (keep last 15 for better activity display)
      const updatedRecentAttacks = [newAttack, ...state.recentAttacks].slice(0, 15);
      
      // Update threat counts
      const updatedThreatCounts = { ...state.threatCounts };
      if (newAttack.threatLevel) {
        updatedThreatCounts[newAttack.threatLevel] = (updatedThreatCounts[newAttack.threatLevel] || 0) + 1;
      }
      
      return {
        ...state,
        attacks: updatedAttacks,
        recentAttacks: updatedRecentAttacks,
        threatCounts: updatedThreatCounts,
        stats: {
          ...state.stats,
          activeAttacks: updatedAttacks.length,
          totalAttacks: state.stats.totalAttacks + 1
        }
      };
      
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.payload }
      };
      
    case 'UPDATE_TOP_TARGETS':
      return {
        ...state,
        topTargets: action.payload
      };
      
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload
      };
      
    case 'CLEAR_OLD_ATTACKS':
      const now = Date.now();
      const attackDuration = 6000; // 6 seconds - enough time for attack animation to complete
      const filteredAttacks = state.attacks.filter(attack => 
        new Date(attack.timestamp).getTime() > (now - attackDuration)
      );
      
      return {
        ...state,
        attacks: filteredAttacks,
        stats: {
          ...state.stats,
          activeAttacks: filteredAttacks.length
        }
      };
      
    default:
      return state;
  }
}

export function AttackProvider({ children }) {
  const [state, dispatch] = useReducer(attackReducer, initialState);

  useEffect(() => {
    // For production deployment, use polling instead of WebSocket
    const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost';
    
    if (isProduction) {
      // Use continuous attack generation for production to simulate real DDoS activity
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      
      const generateSingleAttack = async () => {
        try {
          const response = await axios.get('/api/attacks?endpoint=attacks');
          if (response.data.success && response.data.data.length > 0) {
            // Pick just one random attack from the batch to make it continuous
            const randomAttack = response.data.data[Math.floor(Math.random() * response.data.data.length)];
            // Add random delay to make timing more realistic
            const delay = Math.random() * 1000; // 0-1 second delay
            setTimeout(() => {
              const attackWithNewId = {
                ...randomAttack,
                id: Date.now() + Math.random() * 1000,
                timestamp: new Date().toISOString()
              };
              dispatch({ type: 'ADD_ATTACK', payload: attackWithNewId });
            }, delay);
          }
        } catch (error) {
          console.error('Error generating attack:', error);
        }
      };
      
      // Generate individual attacks at random intervals (500ms to 2 seconds)
      const scheduleNextAttack = () => {
        const nextInterval = 500 + Math.random() * 1500; // 500ms - 2s
        setTimeout(() => {
          generateSingleAttack();
          scheduleNextAttack(); // Schedule the next one
        }, nextInterval);
      };
      
      // Start the continuous attack generation
      scheduleNextAttack();
      
      // Initial fetch for stats
      fetchStats();
      fetchTopTargets();

      // Clean up completed attacks every 5 seconds
      const cleanupInterval = setInterval(() => {
        dispatch({ type: 'CLEAR_OLD_ATTACKS' });
      }, 5000);

      return () => {
        clearInterval(cleanupInterval);
        // Note: scheduleNextAttack uses setTimeout, so no interval to clear
      };
    } else {
      // WebSocket connection for development
      const ws = new WebSocket('ws://localhost:3000');
    
      ws.onopen = () => {
        console.log('Connected to WebSocket');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'attack') {
          dispatch({ type: 'ADD_ATTACK', payload: message.data });
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      };

      // Fetch initial data
      fetchStats();
      fetchTopTargets();

      // Clean up old attacks every minute
      const cleanupInterval = setInterval(() => {
        dispatch({ type: 'CLEAR_OLD_ATTACKS' });
      }, 60000);

      return () => {
        ws.close();
        clearInterval(cleanupInterval);
      };
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/attacks?endpoint=stats');
      if (response.data.success) {
        dispatch({ type: 'UPDATE_STATS', payload: response.data.data });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTopTargets = async () => {
    try {
      const response = await axios.get('/api/attacks?endpoint=stats');
      if (response.data.success && response.data.data.topTargets) {
        dispatch({ type: 'UPDATE_TOP_TARGETS', payload: response.data.data.topTargets });
      }
    } catch (error) {
      console.error('Error fetching top targets:', error);
    }
  };

  const classifyIP = async (ip, additionalData = {}) => {
    try {
      const response = await axios.post('/api/attacks?endpoint=classify', {
        ip,
        additionalData
      });
      return response.data;
    } catch (error) {
      console.error('Error classifying IP:', error);
      return null;
    }
  };

  const value = {
    ...state,
    classifyIP,
    refreshStats: fetchStats,
    refreshTopTargets: fetchTopTargets
  };

  return (
    <AttackContext.Provider value={value}>
      {children}
    </AttackContext.Provider>
  );
}

export function useAttacks() {
  const context = useContext(AttackContext);
  if (context === undefined) {
    throw new Error('useAttacks must be used within an AttackProvider');
  }
  return context;
}
