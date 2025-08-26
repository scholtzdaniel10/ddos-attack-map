import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AttackLine({ start, end, threatLevel, animationSpeed = 2, attackData, isMobile }) {
  const lineRef = useRef();
  const particlesRef = useRef();
  const glowRef = useRef();
  const [progress, setProgress] = useState(0);
  const [intensity, setIntensity] = useState(1);

  // Enhanced color scheme with glow effects
  const getColor = () => {
    switch (threatLevel) {
      case 'high': return '#ff0033';     // Intense red
      case 'medium': return '#ff6600';   // Bright orange  
      case 'low': return '#00ff44';      // Bright green
      default: return '#00ccff';         // Cyber blue
    }
  };

  const getGlowColor = () => {
    switch (threatLevel) {
      case 'high': return '#ff3366';     
      case 'medium': return '#ff9933';     
      case 'low': return '#33ff66';      
      default: return '#33ccff';         
    }
  };

  // Create more realistic curved path
  const curve = useMemo(() => {
    const createRealisticPath = (startPos, endPos) => {
      const distance = startPos.distanceTo(endPos);
      const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
      
      // Vary curve height based on threat level and distance
      const baseHeight = distance * 0.25;
      const threatMultiplier = threatLevel === 'high' ? 1.3 : threatLevel === 'medium' ? 1.1 : 1.0;
      const curveHeight = baseHeight * threatMultiplier;
      
      midPoint.normalize().multiplyScalar(2 + curveHeight);
      
      // Add some randomness for more natural paths
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      midPoint.add(randomOffset);

      const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
      return curve;
    };
    
    return createRealisticPath(start, end);
  }, [start, end, threatLevel]);
  const points = useMemo(() => curve.getPoints(isMobile ? 30 : 60), [curve, isMobile]);

  // Create particle system for more realistic effect
  const particleCount = isMobile ? 15 : 25;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    return positions;
  }, [particleCount]);

  useFrame((state, delta) => {
    if (lineRef.current && progress < 1) {
      // Variable speed based on threat level
      const speedMultiplier = threatLevel === 'high' ? 2.5 : threatLevel === 'medium' ? 2.0 : 1.5;
      const newProgress = Math.min(progress + (delta * animationSpeed * speedMultiplier), 1);
      setProgress(newProgress);

      // Pulsing intensity for high threats
      if (threatLevel === 'high') {
        const pulse = 0.7 + Math.sin(state.clock.elapsedTime * 8) * 0.3;
        setIntensity(pulse);
      } else if (threatLevel === 'medium') {
        const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
        setIntensity(pulse);
      }

      // Update line geometry with trailing effect
      const trailLength = 0.3; // Length of the trail
      const startIdx = Math.max(0, Math.floor((newProgress - trailLength) * points.length));
      const endIdx = Math.floor(newProgress * points.length);
      
      if (endIdx > startIdx && endIdx > 1) {
        const animatedPoints = points.slice(startIdx, endIdx);
        if (animatedPoints.length > 1) {
          const geometry = new THREE.BufferGeometry().setFromPoints(animatedPoints);
          lineRef.current.geometry.dispose();
          lineRef.current.geometry = geometry;
        }
      }

      // Update particles along the path
      if (particlesRef.current && endIdx > 1) {
        const positions = particlePositions;
        for (let i = 0; i < particleCount; i++) {
          const particleProgress = Math.max(0, newProgress - (i / particleCount) * 0.1);
          if (particleProgress > 0 && particleProgress <= 1) {
            const pointIndex = Math.floor(particleProgress * (points.length - 1));
            const point = points[pointIndex];
            if (point) {
              positions[i * 3] = point.x;
              positions[i * 3 + 1] = point.y;
              positions[i * 3 + 2] = point.z;
            }
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  // Create initial geometry
  const geometry = new THREE.BufferGeometry().setFromPoints([start, start]);
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const lineWidth = isMobile ? 1.5 : 2.5;
  const opacity = intensity * (isMobile ? 0.8 : 0.9);

  return (
    <group>
      {/* Main attack line with trailing effect */}
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial
          color={getColor()}
          linewidth={lineWidth}
          transparent
          opacity={opacity}
        />
      </line>

      {/* Glow effect */}
      <line ref={glowRef} geometry={geometry}>
        <lineBasicMaterial
          color={getGlowColor()}
          linewidth={lineWidth * 2}
          transparent
          opacity={opacity * 0.3}
          blending={THREE.AdditiveBlending}
        />
      </line>

      {/* Particle trail for high-threat attacks */}
      {threatLevel === 'high' && (
        <points ref={particlesRef} geometry={particleGeometry}>
          <pointsMaterial
            color={getColor()}
            size={isMobile ? 0.02 : 0.03}
            transparent
            opacity={opacity * 0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}

export default AttackLine;
