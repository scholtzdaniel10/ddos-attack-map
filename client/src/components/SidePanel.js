import React from 'react';
import styled from 'styled-components';
import { useAttacks } from '../context/AttackContext';

const SidePanelContainer = styled.div`
  width: 300px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-left: 1px solid #00ff41;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 60px);
`;

const PanelSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #00ff41;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(0, 255, 65, 0.3);
  padding-bottom: 5px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const StatItem = styled.div`
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const StatLabel = styled.span`
  display: block;
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 5px;
`;

const StatValue = styled.span`
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #00ff41;
  text-shadow: 0 0 5px #00ff41;
`;

const ThreatLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ThreatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
`;

const ThreatColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => {
    switch(props.level) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa44';
      case 'low': return '#44ff44';
      default: return '#00ff41';
    }
  }};
  box-shadow: 0 0 10px ${props => {
    switch(props.level) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa44';
      case 'low': return '#44ff44';
      default: return '#00ff41';
    }
  }};
`;

const ThreatCount = styled.span`
  margin-left: auto;
  font-weight: 700;
  color: #00ff41;
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

const AttackSource = styled.div`
  font-weight: 700;
  color: #00ff41;
  margin-bottom: 2px;
`;

const AttackTarget = styled.div`
  color: #ff6b6b;
  margin-bottom: 2px;
`;

const AttackTime = styled.div`
  color: #666;
  font-size: 0.7rem;
`;

const TopList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TopItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
`;

const TopItemName = styled.span`
  font-weight: 600;
`;

const TopItemCount = styled.span`
  color: #ff6b6b;
  font-weight: 700;
`;

function SidePanel() {
  const { stats, threatCounts, recentAttacks, topTargets } = useAttacks();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <SidePanelContainer>
      <PanelSection>
        <SectionTitle>Live Statistics</SectionTitle>
        <StatsGrid>
          <StatItem>
            <StatLabel>Active Attacks</StatLabel>
            <StatValue>{stats.activeAttacks}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Total Today</StatLabel>
            <StatValue>{stats.totalAttacks}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Countries</StatLabel>
            <StatValue>{stats.countries}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Avg Threat</StatLabel>
            <StatValue>{stats.avgThreat}</StatValue>
          </StatItem>
        </StatsGrid>
      </PanelSection>

      <PanelSection>
        <SectionTitle>Threat Levels</SectionTitle>
        <ThreatLegend>
          <ThreatItem>
            <ThreatColor level="high" />
            <span>High Risk</span>
            <ThreatCount>{threatCounts.high}</ThreatCount>
          </ThreatItem>
          <ThreatItem>
            <ThreatColor level="medium" />
            <span>Medium Risk</span>
            <ThreatCount>{threatCounts.medium}</ThreatCount>
          </ThreatItem>
          <ThreatItem>
            <ThreatColor level="low" />
            <span>Low Risk</span>
            <ThreatCount>{threatCounts.low}</ThreatCount>
          </ThreatItem>
        </ThreatLegend>
      </PanelSection>

      <PanelSection>
        <SectionTitle>Recent Attacks</SectionTitle>
        <RecentAttacks>
          {recentAttacks.map((attack, index) => (
            <AttackItem key={attack.id || index} level={attack.threatLevel}>
              <AttackSource>
                {attack.source?.country} → {attack.target?.country}
              </AttackSource>
              <AttackTarget>
                {attack.source?.ip} → {attack.target?.ip}
              </AttackTarget>
              <AttackTime>
                {formatTime(attack.timestamp)}
              </AttackTime>
            </AttackItem>
          ))}
          {recentAttacks.length === 0 && (
            <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No recent attacks
            </div>
          )}
        </RecentAttacks>
      </PanelSection>

      <PanelSection>
        <SectionTitle>Top Targets</SectionTitle>
        <TopList>
          {topTargets.map((target, index) => (
            <TopItem key={index}>
              <TopItemName>{target.country}</TopItemName>
              <TopItemCount>{target.count}</TopItemCount>
            </TopItem>
          ))}
          {topTargets.length === 0 && (
            <div style={{ color: '#666', textAlign: 'center', padding: '10px' }}>
              No data available
            </div>
          )}
        </TopList>
      </PanelSection>
    </SidePanelContainer>
  );
}

export default SidePanel;
