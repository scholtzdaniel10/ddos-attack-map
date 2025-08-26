import React from 'react';
import styled from 'styled-components';
import { useAttacks } from '../context/AttackContext';

const MobilePanelOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(15px);
  z-index: 2000;
  display: ${props => props.isVisible ? 'flex' : 'none'};
  flex-direction: column;
  padding: 70px 15px 30px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  
  /* Better touch scrolling */
  @media (max-height: 600px) {
    padding: 60px 15px 20px;
  }
  
  /* Handle notch areas on newer phones */
  padding-top: max(70px, env(safe-area-inset-top) + 20px);
  padding-bottom: max(30px, env(safe-area-inset-bottom) + 10px);
  padding-left: max(15px, env(safe-area-inset-left) + 15px);
  padding-right: max(15px, env(safe-area-inset-right) + 15px);
`;

const MobilePanelContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: max(70px, env(safe-area-inset-top) + 20px);
  right: max(20px, env(safe-area-inset-right) + 20px);
  background: rgba(0, 255, 65, 0.15);
  border: 2px solid #00ff41;
  color: #00ff41;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.3rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease;
  
  /* Larger touch target for easier tapping */
  &:before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
  }
  
  &:active {
    background: rgba(0, 255, 65, 0.25);
    transform: scale(0.95);
  }
  
  @media (max-height: 600px) {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
    padding: 10px;
  }
`;

const Section = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 8px;
  padding: 15px;
`;

const SectionTitle = styled.h3`
  color: #00ff41;
  font-size: 1rem;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
`;

const StatItem = styled.div`
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 6px;
  padding: 10px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: #888;
  margin-bottom: 3px;
`;

const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #00ff41;
`;

const ControlGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  color: #00ff41;
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const Slider = styled.input`
  width: 100%;
  height: 30px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff41;
  border-radius: 4px;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: #00ff41;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const Select = styled.select`
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff41;
  color: #00ff41;
  padding: 10px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  
  option {
    background: #000;
    color: #00ff41;
  }
`;

const ThreatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ThreatItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  border-left: 3px solid ${props => {
    switch(props.level) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa44';
      case 'low': return '#44ff44';
      default: return '#00ff41';
    }
  }};
`;

const RecentAttacks = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const AttackItem = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-left: 3px solid ${props => {
    switch(props.level) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa44';
      case 'low': return '#44ff44';
      default: return '#00ff41';
    }
  }};
  padding: 8px;
  margin-bottom: 8px;
  font-size: 0.8rem;
`;

function MobilePanel({ 
  isVisible, 
  onClose, 
  animationSpeed, 
  setAnimationSpeed, 
  threatFilter, 
  setThreatFilter 
}) {
  const { stats, threatCounts, recentAttacks } = useAttacks();

  const handleSpeedChange = (event) => {
    setAnimationSpeed(parseFloat(event.target.value));
  };

  const handleFilterChange = (event) => {
    setThreatFilter(event.target.value);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <MobilePanelOverlay isVisible={isVisible}>
      <CloseButton onClick={onClose}>×</CloseButton>
      
      <MobilePanelContent>
        <Section>
          <SectionTitle>Live Statistics</SectionTitle>
          <StatsGrid>
            <StatItem>
              <StatLabel>Active</StatLabel>
              <StatValue>{stats.activeAttacks}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Total</StatLabel>
              <StatValue>{stats.totalAttacks}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Countries</StatLabel>
              <StatValue>{stats.countries}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Threat</StatLabel>
              <StatValue>{stats.avgThreat}</StatValue>
            </StatItem>
          </StatsGrid>
        </Section>

        <Section>
          <SectionTitle>Controls</SectionTitle>
          <ControlGroup>
            <Label>Speed: {animationSpeed.toFixed(1)}x</Label>
            <Slider
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={animationSpeed}
              onChange={handleSpeedChange}
            />
          </ControlGroup>
          <ControlGroup>
            <Label>Filter Threats</Label>
            <Select value={threatFilter} onChange={handleFilterChange}>
              <option value="all">All Threats</option>
              <option value="high">High Risk Only</option>
              <option value="medium">Medium Risk Only</option>
              <option value="low">Low Risk Only</option>
            </Select>
          </ControlGroup>
        </Section>

        <Section>
          <SectionTitle>Threat Levels</SectionTitle>
          <ThreatList>
            <ThreatItem level="high">
              <span>🔴 High Risk</span>
              <span>{threatCounts.high}</span>
            </ThreatItem>
            <ThreatItem level="medium">
              <span>🟡 Medium Risk</span>
              <span>{threatCounts.medium}</span>
            </ThreatItem>
            <ThreatItem level="low">
              <span>🟢 Low Risk</span>
              <span>{threatCounts.low}</span>
            </ThreatItem>
          </ThreatList>
        </Section>

        <Section>
          <SectionTitle>Recent Attacks</SectionTitle>
          <RecentAttacks>
            {recentAttacks.slice(0, 5).map((attack, index) => (
              <AttackItem key={attack.id || index} level={attack.threatLevel}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                  {attack.source?.country} → {attack.target?.country}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                  {formatTime(attack.timestamp)}
                </div>
              </AttackItem>
            ))}
          </RecentAttacks>
        </Section>
      </MobilePanelContent>
    </MobilePanelOverlay>
  );
}

export default MobilePanel;
