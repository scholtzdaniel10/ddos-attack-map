class ThreatClassifier {
    constructor() {
        // Initialize with pre-trained model weights (simplified)
        this.model = {
            weights: {
                packetSize: 0.3,
                frequency: 0.4,
                sourceReputation: 0.2,
                geographicAnomaly: 0.1
            },
            thresholds: {
                high: 0.7,
                medium: 0.4
            }
        };
        
        // Known malicious IP patterns (simplified)
        this.maliciousPatterns = [
            /^185\./, // Known botnet range
            /^91\./, // Another suspicious range
            /^103\./ // Suspicious range
        ];
        
        // Reputation database (mock)
        this.reputationDB = new Map([
            ['185.220.101.1', { score: 0.9, reports: 150 }],
            ['91.134.45.23', { score: 0.8, reports: 89 }],
            ['103.45.67.89', { score: 0.7, reports: 67 }]
        ]);
    }

    async classifyThreat(attackData) {
        try {
            const features = this.extractFeatures(attackData);
            const threatScore = this.calculateThreatScore(features);
            const level = this.determineThreatLevel(threatScore);
            
            return {
                level: level,
                confidence: Math.min(threatScore + 0.1, 1.0),
                score: threatScore,
                features: features,
                reasoning: this.generateReasoning(features, level)
            };
        } catch (error) {
            console.error('Error classifying threat:', error);
            return {
                level: 'unknown',
                confidence: 0.0,
                score: 0.0,
                features: {},
                reasoning: 'Classification failed'
            };
        }
    }

    extractFeatures(attackData) {
        const features = {};
        
        // Packet size analysis
        features.packetSizeAnomaly = this.analyzePacketSize(attackData.packetSize || 0);
        
        // Frequency analysis
        features.frequencyAnomaly = this.analyzeFrequency(attackData.frequency || 0);
        
        // Source IP reputation
        features.sourceReputation = this.getIPReputation(attackData.sourceIP || attackData.ip);
        
        // Geographic anomaly
        features.geographicAnomaly = this.analyzeGeographicAnomaly(attackData);
        
        // Time-based patterns
        features.timeAnomaly = this.analyzeTimePattern(attackData.timestamp);
        
        // IP pattern matching
        features.ipPatternMatch = this.matchMaliciousPatterns(attackData.sourceIP || attackData.ip);
        
        return features;
    }

    calculateThreatScore(features) {
        let score = 0;
        
        // Weighted feature combination
        score += features.packetSizeAnomaly * this.model.weights.packetSize;
        score += features.frequencyAnomaly * this.model.weights.frequency;
        score += features.sourceReputation * this.model.weights.sourceReputation;
        score += features.geographicAnomaly * this.model.weights.geographicAnomaly;
        
        // Additional factors
        score += features.timeAnomaly * 0.1;
        score += features.ipPatternMatch * 0.2;
        
        // Normalize to 0-1 range
        return Math.max(0, Math.min(1, score));
    }

    determineThreatLevel(score) {
        if (score >= this.model.thresholds.high) {
            return 'high';
        } else if (score >= this.model.thresholds.medium) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    analyzePacketSize(packetSize) {
        // Large packets might indicate amplification attacks
        if (packetSize > 1200) return 0.8;
        if (packetSize > 800) return 0.5;
        if (packetSize < 64) return 0.3; // Suspicious small packets
        return 0.1;
    }

    analyzeFrequency(frequency) {
        // High frequency indicates potential DDoS
        if (frequency > 500) return 0.9;
        if (frequency > 100) return 0.6;
        if (frequency > 50) return 0.3;
        return 0.1;
    }

    getIPReputation(ip) {
        if (!ip) return 0.0;
        
        const reputation = this.reputationDB.get(ip);
        if (reputation) {
            return reputation.score;
        }
        
        // Check against known patterns
        if (this.matchMaliciousPatterns(ip) > 0.5) {
            return 0.7;
        }
        
        return 0.2; // Unknown IP, low threat by default
    }

    analyzeGeographicAnomaly(attackData) {
        // High-risk countries or unusual routing patterns
        const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
        
        if (attackData.source && highRiskCountries.includes(attackData.source.country)) {
            return 0.6;
        }
        
        return 0.2;
    }

    analyzeTimePattern(timestamp) {
        if (!timestamp) return 0.0;
        
        const hour = new Date(timestamp).getHours();
        
        // Attacks during off-hours might be more suspicious
        if (hour < 6 || hour > 22) {
            return 0.4;
        }
        
        return 0.1;
    }

    matchMaliciousPatterns(ip) {
        if (!ip) return 0.0;
        
        for (const pattern of this.maliciousPatterns) {
            if (pattern.test(ip)) {
                return 0.8;
            }
        }
        
        return 0.0;
    }

    generateReasoning(features, level) {
        const reasons = [];
        
        if (features.sourceReputation > 0.6) {
            reasons.push('Known malicious IP');
        }
        
        if (features.frequencyAnomaly > 0.5) {
            reasons.push('High request frequency');
        }
        
        if (features.packetSizeAnomaly > 0.5) {
            reasons.push('Suspicious packet size');
        }
        
        if (features.ipPatternMatch > 0.5) {
            reasons.push('Matches known botnet pattern');
        }
        
        if (features.geographicAnomaly > 0.5) {
            reasons.push('High-risk geographic origin');
        }
        
        if (reasons.length === 0) {
            reasons.push('Low threat indicators detected');
        }
        
        return reasons.join(', ');
    }

    // Update model with new training data
    updateModel(trainingData) {
        // In a real implementation, this would retrain the model
        console.log('Model update requested with', trainingData.length, 'samples');
        
        // For now, just log the request
        return {
            success: true,
            message: 'Model update queued',
            samples: trainingData.length
        };
    }

    // Get threat statistics
    getThreatStatistics(attacks) {
        const stats = {
            total: attacks.length,
            high: 0,
            medium: 0,
            low: 0,
            unknown: 0
        };
        
        attacks.forEach(attack => {
            if (attack.threatLevel) {
                stats[attack.threatLevel]++;
            } else {
                stats.unknown++;
            }
        });
        
        return stats;
    }

    // Batch classify multiple attacks
    async classifyMultiple(attacksData) {
        const promises = attacksData.map(attack => this.classifyThreat(attack));
        return await Promise.all(promises);
    }
}

module.exports = new ThreatClassifier();
