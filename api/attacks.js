const axios = require('axios');

// Mock data for demonstration - in production you'd integrate with real APIs
const geoLocation = {
    getCoordinates: async (ip) => {
        // Mock coordinates based on IP patterns
        const mockCoords = {
            '203.0.113.1': { lat: 40.7128, lng: -74.0060, country: 'US' },
            '192.0.2.1': { lat: 35.6762, lng: 139.6503, country: 'JP' },
            '198.51.100.1': { lat: 51.5074, lng: -0.1278, country: 'GB' }
        };
        return mockCoords[ip] || { lat: 0, lng: 0, country: 'Unknown' };
    }
};

const threatClassifier = {
    classifyThreat: async (data) => {
        // Mock ML classification
        const levels = ['low', 'medium', 'high'];
        return {
            level: levels[Math.floor(Math.random() * levels.length)],
            confidence: Math.random()
        };
    }
};

async function fetchAttackData() {
    // Enhanced mock attacks with more global IP addresses and realistic patterns
    const globalIPs = [
        // Major US cities and data centers
        { ip: '203.0.113.1', lat: 40.7128, lng: -74.0060, country: 'US', city: 'New York' },
        { ip: '104.16.249.249', lat: 37.7749, lng: -122.4194, country: 'US', city: 'San Francisco' },
        { ip: '172.217.164.142', lat: 37.4419, lng: -122.1430, country: 'US', city: 'Mountain View' },
        { ip: '13.107.42.14', lat: 47.6062, lng: -122.3321, country: 'US', city: 'Seattle' },
        { ip: '157.240.241.35', lat: 33.9425, lng: -118.4081, country: 'US', city: 'Los Angeles' },
        
        // Major international locations
        { ip: '192.0.2.1', lat: 35.6762, lng: 139.6503, country: 'JP', city: 'Tokyo' },
        { ip: '198.51.100.1', lat: 51.5074, lng: -0.1278, country: 'GB', city: 'London' },
        { ip: '185.199.108.153', lat: 52.5200, lng: 13.4050, country: 'DE', city: 'Berlin' },
        { ip: '151.101.193.140', lat: 48.8566, lng: 2.3522, country: 'FR', city: 'Paris' },
        { ip: '8.8.8.8', lat: 37.4223, lng: -122.0848, country: 'US', city: 'Google DNS' },
        { ip: '1.1.1.1', lat: 37.7749, lng: -122.4194, country: 'US', city: 'Cloudflare DNS' },
        
        // Common attack origins (known botnet/malicious regions)
        { ip: '45.90.28.0', lat: 55.7558, lng: 37.6173, country: 'RU', city: 'Moscow' },
        { ip: '180.76.15.0', lat: 39.9042, lng: 116.4074, country: 'CN', city: 'Beijing' },
        { ip: '202.108.22.5', lat: 31.2304, lng: 121.4737, country: 'CN', city: 'Shanghai' },
        { ip: '103.28.248.0', lat: 1.3521, lng: 103.8198, country: 'SG', city: 'Singapore' },
        { ip: '200.160.2.3', lat: -23.5505, lng: -46.6333, country: 'BR', city: 'São Paulo' },
        { ip: '196.216.2.0', lat: -26.2041, lng: 28.0473, country: 'ZA', city: 'Johannesburg' },
        { ip: '41.233.139.0', lat: 30.0444, lng: 31.2357, country: 'EG', city: 'Cairo' },
        { ip: '202.12.29.0', lat: -37.8136, lng: 144.9631, country: 'AU', city: 'Melbourne' },
        
        // European data centers
        { ip: '46.23.104.0', lat: 59.9311, lng: 30.3609, country: 'RU', city: 'St. Petersburg' },
        { ip: '217.160.0.0', lat: 50.1109, lng: 8.6821, country: 'DE', city: 'Frankfurt' },
        { ip: '94.142.241.0', lat: 55.6761, lng: 12.5683, country: 'DK', city: 'Copenhagen' },
        
        // Asian tech hubs
        { ip: '14.139.180.0', lat: 28.7041, lng: 77.1025, country: 'IN', city: 'New Delhi' },
        { ip: '125.6.190.0', lat: 37.5665, lng: 126.9780, country: 'KR', city: 'Seoul' },
        { ip: '203.104.144.0', lat: 25.0330, lng: 121.5654, country: 'TW', city: 'Taipei' }
    ];
    
    // Realistic attack patterns
    const attackTypes = [
        { type: 'DDoS', weight: 40, threatBias: 'high' },
        { type: 'Botnet', weight: 25, threatBias: 'medium' },
        { type: 'Scanning', weight: 20, threatBias: 'low' },
        { type: 'Intrusion', weight: 10, threatBias: 'high' },
        { type: 'Malware', weight: 5, threatBias: 'medium' }
    ];
    
    const attacks = [];
    const attackCount = 1; // Single attack for continuous flow
    
    for (let i = 0; i < attackCount; i++) {
        // Bias source selection toward known attack origins
        const isFromKnownAttacker = Math.random() < 0.6;
        const sourcePool = isFromKnownAttacker 
            ? globalIPs.filter(ip => ['RU', 'CN', 'KP'].includes(ip.country))
            : globalIPs;
        
        // Bias target selection toward major infrastructure
        const isTargetingInfrastructure = Math.random() < 0.7;
        const targetPool = isTargetingInfrastructure
            ? globalIPs.filter(ip => ['US', 'GB', 'DE', 'JP'].includes(ip.country))
            : globalIPs;
        
        const source = sourcePool[Math.floor(Math.random() * sourcePool.length)];
        const target = targetPool[Math.floor(Math.random() * targetPool.length)];
        
        if (source.ip !== target.ip) {
            // Select attack type based on weights
            const random = Math.random() * 100;
            let cumulative = 0;
            let selectedType = attackTypes[0];
            
            for (const type of attackTypes) {
                cumulative += type.weight;
                if (random <= cumulative) {
                    selectedType = type;
                    break;
                }
            }
            
            // Determine threat level with bias
            let threatLevel;
            const threatRandom = Math.random();
            if (selectedType.threatBias === 'high') {
                threatLevel = threatRandom < 0.6 ? 'high' : threatRandom < 0.85 ? 'medium' : 'low';
            } else if (selectedType.threatBias === 'medium') {
                threatLevel = threatRandom < 0.3 ? 'high' : threatRandom < 0.7 ? 'medium' : 'low';
            } else {
                threatLevel = threatRandom < 0.1 ? 'high' : threatRandom < 0.3 ? 'medium' : 'low';
            }
            
            attacks.push({
                id: Date.now() + Math.random() * 1000 + i,
                source,
                target,
                threatLevel,
                attackType: selectedType.type,
                timestamp: new Date().toISOString(),
                duration: threatLevel === 'high' ? 4000 + Math.random() * 2000 : 
                         threatLevel === 'medium' ? 3000 + Math.random() * 1500 : 
                         2500 + Math.random() * 1000
            });
        }
    }
    
    return attacks;
}

module.exports = async function handler(req, res) {
    const { method, query } = req;
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const endpoint = query.endpoint || 'attacks';
        
        switch (endpoint) {
            case 'attacks':
                if (method === 'GET') {
                    const attacks = await fetchAttackData();
                    return res.json({ success: true, data: attacks });
                }
                break;
                
            case 'stats':
                if (method === 'GET') {
                    const stats = {
                        totalAttacks: 1247 + Math.floor(Math.random() * 100),
                        activeAttacks: 15 + Math.floor(Math.random() * 20),
                        countries: 45 + Math.floor(Math.random() * 10),
                        topTargets: [
                            { country: 'United States', count: 342 + Math.floor(Math.random() * 50) },
                            { country: 'Germany', count: 198 + Math.floor(Math.random() * 30) },
                            { country: 'United Kingdom', count: 156 + Math.floor(Math.random() * 25) }
                        ],
                        topSources: [
                            { country: 'China', count: 89 + Math.floor(Math.random() * 20) },
                            { country: 'Russia', count: 67 + Math.floor(Math.random() * 15) },
                            { country: 'North Korea', count: 45 + Math.floor(Math.random() * 10) }
                        ],
                        threatLevels: {
                            high: 45 + Math.floor(Math.random() * 20),
                            medium: 123 + Math.floor(Math.random() * 30),
                            low: 89 + Math.floor(Math.random() * 25)
                        }
                    };
                    return res.json({ success: true, data: stats });
                }
                break;
                
            case 'classify':
                if (method === 'POST') {
                    const { ip, additionalData } = req.body;
                    
                    if (!ip) {
                        return res.status(400).json({ success: false, error: 'IP address required' });
                    }
                    
                    const coordinates = await geoLocation.getCoordinates(ip);
                    const threatLevel = await threatClassifier.classifyThreat({
                        ip,
                        ...additionalData
                    });
                    
                    return res.json({
                        success: true,
                        data: {
                            ip,
                            coordinates,
                            threatLevel: threatLevel.level,
                            confidence: threatLevel.confidence,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
                break;
                
            default:
                return res.status(404).json({ success: false, error: 'Endpoint not found' });
        }
        
        return res.status(405).json({ success: false, error: 'Method not allowed' });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
