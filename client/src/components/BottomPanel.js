import React, { useState } from 'react';
import styled from 'styled-components';

const BottomPanelContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 300px;
  height: 80px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid #00ff41;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
`;

const InfoDisplay = styled.div`
  flex: 1;
`;

const HoverInfo = styled.div`
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid #00ff41;
  border-radius: 8px;
  padding: 10px;
  max-width: 300px;
  display: ${props => props.visible ? 'block' : 'none'};
`;

const HoverTitle = styled.h4`
  color: #00ff41;
  margin-bottom: 5px;
  font-size: 0.9rem;
`;

const HoverDetails = styled.p`
  color: #ccc;
  font-size: 0.8rem;
  line-height: 1.3;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 0.9rem;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Label = styled.label`
  color: #00ff41;
`;

const Slider = styled.input`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff41;
  color: #00ff41;
  border-radius: 4px;
  font-family: inherit;
  width: 100px;
  height: 20px;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 15px;
    height: 15px;
    background: #00ff41;
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-webkit-slider-track {
    background: rgba(0, 255, 65, 0.2);
    height: 4px;
    border-radius: 2px;
  }
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff41;
  color: #00ff41;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: inherit;
  
  option {
    background: #000;
    color: #00ff41;
  }
`;

const SpeedValue = styled.span`
  color: #00ff41;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
`;

function BottomPanel({ 
  animationSpeed, 
  setAnimationSpeed, 
  threatFilter, 
  setThreatFilter 
}) {
  const [hoverInfo] = useState({
    visible: false,
    title: 'Attack Info',
    details: 'Hover over an attack line for details'
  });

  const handleSpeedChange = (event) => {
    setAnimationSpeed(parseFloat(event.target.value));
  };

  const handleFilterChange = (event) => {
    setThreatFilter(event.target.value);
  };

  return (
    <BottomPanelContainer>
      <InfoDisplay>
        <HoverInfo visible={hoverInfo.visible}>
          <HoverTitle>{hoverInfo.title}</HoverTitle>
          <HoverDetails>{hoverInfo.details}</HoverDetails>
        </HoverInfo>
      </InfoDisplay>
      
      <Controls>
        <ControlGroup>
          <Label htmlFor="speed-slider">Animation Speed:</Label>
          <Slider
            id="speed-slider"
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={handleSpeedChange}
          />
          <SpeedValue>{animationSpeed.toFixed(1)}x</SpeedValue>
        </ControlGroup>
        
        <ControlGroup>
          <Label htmlFor="filter-threat">Filter by Threat:</Label>
          <Select
            id="filter-threat"
            value={threatFilter}
            onChange={handleFilterChange}
          >
            <option value="all">All Threats</option>
            <option value="high">High Risk Only</option>
            <option value="medium">Medium Risk Only</option>
            <option value="low">Low Risk Only</option>
          </Select>
        </ControlGroup>
      </Controls>
    </BottomPanelContainer>
  );
}

export default BottomPanel;
