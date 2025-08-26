import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
`;

const LoadingContent = styled.div`
  text-align: center;
  color: #00ff41;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid #333;
  border-top: 3px solid #00ff41;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto 20px;
`;

const LoadingTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 10px;
  text-shadow: 0 0 10px #00ff41;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const LoadingText = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

function LoadingScreen() {
  return (
    <LoadingContainer>
      <LoadingContent>
        <LoadingSpinner />
        <LoadingTitle>Initializing Threat Map</LoadingTitle>
        <LoadingText>Loading global attack data...</LoadingText>
      </LoadingContent>
    </LoadingContainer>
  );
}

export default LoadingScreen;
