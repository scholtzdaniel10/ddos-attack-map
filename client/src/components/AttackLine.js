import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AttackLine({ start, end, threatLevel, animationSpeed = 1, attackData, isMobile }) {
  const lineRef = useRef();
  const [progress, setProgress] = useState(0);

  // Color based on threat level
  const getColor = () => {
    switch (threatLevel) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa44';
      case 'low': return '#44ff44';
      default: return '#00ff41';
    }
  };

  // Create curved path between two points
  const createCurvedPath = (startPos, endPos) => {
    const distance = startPos.distanceTo(endPos);
    const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    
    // Make the curve height proportional to distance
    const curveHeight = Math.max(distance * 0.3, 0.5);
    midPoint.normalize().multiplyScalar(2 + curveHeight);

    const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
    return curve;
  };

  const curve = createCurvedPath(start, end);
  const points = curve.getPoints(isMobile ? 25 : 50); // Fewer points on mobile

  useFrame((state, delta) => {
    if (lineRef.current && progress < 1) {
      const newProgress = Math.min(progress + (delta * animationSpeed * 0.5), 1);
      setProgress(newProgress);

      // Update line geometry to show animation
      const animatedPoints = points.slice(0, Math.floor(newProgress * points.length));
      if (animatedPoints.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(animatedPoints);
        lineRef.current.geometry.dispose();
        lineRef.current.geometry = geometry;
      }
    }
  });

  // Create initial geometry
  const geometry = new THREE.BufferGeometry().setFromPoints([start, start]);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={getColor()}
        linewidth={isMobile ? 1 : 2}
        transparent
        opacity={isMobile ? 0.6 : 0.8}
      />
    </line>
  );
}

export default AttackLine;
