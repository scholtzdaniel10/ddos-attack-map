import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Globe from './components/Globe';
import SidePanel from './components/SidePanel';
import Header from './components/Header';
import BottomPanel from './components/BottomPanel';
import LoadingScreen from './components/LoadingScreen';
import MobilePanel from './components/MobilePanel';
import { AttackProvider } from './context/AttackContext';
import { useMediaQuery } from './hooks/useMediaQuery';
import './App.css';

const AppContainer = styled.div`
  font-family: 'Orbitron', monospace;
  background: radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%);
  color: #00ff41;
  overflow: hidden;
  height: 100vh;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
`;

const MainContainer = styled.div`
  display: flex;
  height: calc(100vh - 60px);
  margin-top: 60px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [threatFilter, setThreatFilter] = useState('all');
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // Faster loading on mobile
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, isMobile ? 1500 : 3000);

    return () => clearTimeout(timer);
  }, [isMobile]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AttackProvider>
      <AppContainer>
        <Header 
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          isMobile={isMobile}
          onToggleMobilePanel={() => setShowMobilePanel(!showMobilePanel)}
        />
        <MainContainer>
          <Globe 
            isPaused={isPaused}
            animationSpeed={animationSpeed}
            threatFilter={threatFilter}
            isMobile={isMobile}
          />
          {!isMobile && <SidePanel />}
        </MainContainer>
        {!isMobile && (
          <BottomPanel
            animationSpeed={animationSpeed}
            setAnimationSpeed={setAnimationSpeed}
            threatFilter={threatFilter}
            setThreatFilter={setThreatFilter}
          />
        )}
        {isMobile && (
          <MobilePanel
            isVisible={showMobilePanel}
            onClose={() => setShowMobilePanel(false)}
            animationSpeed={animationSpeed}
            setAnimationSpeed={setAnimationSpeed}
            threatFilter={threatFilter}
            setThreatFilter={setThreatFilter}
          />
        )}
      </AppContainer>
    </AttackProvider>
  );
}

export default App;
