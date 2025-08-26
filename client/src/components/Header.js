import React from 'react';
import styled from 'styled-components';
import { useAttacks } from '../context/AttackContext';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #00ff41;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  padding-top: env(safe-area-inset-top);
  padding-left: calc(20px + env(safe-area-inset-left));
  padding-right: calc(20px + env(safe-area-inset-right));
  z-index: 1000;
  
  @media (max-width: 768px) {
    padding-left: calc(15px + env(safe-area-inset-left));
    padding-right: calc(15px + env(safe-area-inset-right));
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 900;
  color: #00ff41;
  text-shadow: 0 0 10px #00ff41;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const TitleIcon = styled.span`
  font-size: 1.8rem;
  margin-right: 10px;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 5px;
  }
`;

const ControlButton = styled.button`
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid #00ff41;
  color: #00ff41;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  touch-action: manipulation;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background: rgba(0, 255, 65, 0.2);
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.95) translateY(0);
    background: rgba(0, 255, 65, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 0.85rem;
    min-height: 48px;
    min-width: 48px;
    border-radius: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 0.8rem;
    min-height: 44px;
    min-width: 44px;
  }
`;

const MobileMenuButton = styled(ControlButton)`
  @media (min-width: 769px) {
    display: none;
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#00ff41' : '#ff4444'};
  box-shadow: 0 0 10px ${props => props.connected ? '#00ff41' : '#ff4444'};
`;

function Header({ isPaused, setIsPaused, isMobile, onToggleMobilePanel }) {
  const { isConnected } = useAttacks();

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <HeaderContainer>
      <Title>
        <TitleIcon>🌍</TitleIcon>
        {!isMobile && '3D DDoS Attack Map'}
        {isMobile && 'DDoS Map'}
      </Title>
      
      <HeaderControls>
        {!isMobile && (
          <ConnectionStatus>
            <StatusDot connected={isConnected} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </ConnectionStatus>
        )}
        
        <ControlButton onClick={handlePause}>
          {isMobile ? (isPaused ? '▶️' : '⏸️') : (isPaused ? '▶️ Resume' : '⏸️ Pause')}
        </ControlButton>
        
        {!isMobile && (
          <>
            <ControlButton onClick={handleReset}>
              🔄 Reset
            </ControlButton>
            
            <ControlButton onClick={handleFullscreen}>
              ⛶ Fullscreen
            </ControlButton>
          </>
        )}
        
        {isMobile && (
          <MobileMenuButton onClick={onToggleMobilePanel}>
            ☰
          </MobileMenuButton>
        )}
      </HeaderControls>
    </HeaderContainer>
  );
}

export default Header;
