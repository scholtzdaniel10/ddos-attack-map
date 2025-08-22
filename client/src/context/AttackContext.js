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
      const updatedAttacks = [...state.attacks, newAttack].slice(-100); // Keep last 100 attacks
      
      // Update recent attacks (keep last 10)
      const updatedRecentAttacks = [newAttack, ...state.recentAttacks].slice(0, 10);
      
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
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      const filteredAttacks = state.attacks.filter(attack => 
        new Date(attack.timestamp).getTime() > fiveMinutesAgo
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
    // WebSocket connection - handle both development and production
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NODE_ENV === 'production' 
      ? window.location.host 
      : 'localhost:3000';
    const ws = new WebSocket(`${wsProtocol}//${wsHost}`);
    
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
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      if (response.data.success) {
        dispatch({ type: 'UPDATE_STATS', payload: response.data.data });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTopTargets = async () => {
    try {
      const response = await axios.get('/api/stats');
      if (response.data.success && response.data.data.topTargets) {
        dispatch({ type: 'UPDATE_TOP_TARGETS', payload: response.data.data.topTargets });
      }
    } catch (error) {
      console.error('Error fetching top targets:', error);
    }
  };

  const classifyIP = async (ip, additionalData = {}) => {
    try {
      const response = await axios.post('/api/classify', {
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
