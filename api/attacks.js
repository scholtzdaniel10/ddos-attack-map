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
    // Enhanced mock attacks with more global IP addresses for higher activity
    const globalIPs = [
        { ip: '203.0.113.1', lat: 40.7128, lng: -74.0060, country: 'US' },
        { ip: '192.0.2.1', lat: 35.6762, lng: 139.6503, country: 'JP' },
        { ip: '198.51.100.1', lat: 51.5074, lng: -0.1278, country: 'GB' },
        { ip: '185.199.108.153', lat: 52.5200, lng: 13.4050, country: 'DE' },
        { ip: '151.101.193.140', lat: 48.8566, lng: 2.3522, country: 'FR' },
        { ip: '104.16.249.249', lat: 37.7749, lng: -122.4194, country: 'US' },
        { ip: '172.217.164.142', lat: 37.4419, lng: -122.1430, country: 'US' },
        { ip: '13.107.42.14', lat: 47.6062, lng: -122.3321, country: 'US' },
        { ip: '157.240.241.35', lat: 37.7749, lng: -122.4194, country: 'US' },
        { ip: '142.250.191.14', lat: 37.4419, lng: -122.1430, country: 'US' },
        { ip: '8.8.8.8', lat: 37.4223, lng: -122.0848, country: 'US' },
        { ip: '1.1.1.1', lat: 37.7749, lng: -122.4194, country: 'US' },
        { ip: '45.90.28.0', lat: 55.7558, lng: 37.6173, country: 'RU' },
        { ip: '180.76.15.0', lat: 39.9042, lng: 116.4074, country: 'CN' },
        { ip: '202.108.22.5', lat: 39.9042, lng: 116.4074, country: 'CN' },
        { ip: '103.28.248.0', lat: 1.3521, lng: 103.8198, country: 'SG' },
        { ip: '200.160.2.3', lat: -23.5505, lng: -46.6333, country: 'BR' },
        { ip: '196.216.2.0', lat: -26.2041, lng: 28.0473, country: 'ZA' },
        { ip: '41.233.139.0', lat: 30.0444, lng: 31.2357, country: 'EG' },
        { ip: '202.12.29.0', lat: -37.8136, lng: 144.9631, country: 'AU' }
    ];
    
    const attacks = [];
    const attackCount = 5 + Math.floor(Math.random() * 8); // 5-12 attacks for high activity
    
    for (let i = 0; i < attackCount; i++) {
        const source = globalIPs[Math.floor(Math.random() * globalIPs.length)];
        const target = globalIPs[Math.floor(Math.random() * globalIPs.length)];
        
        if (source.ip !== target.ip) {
            const threatLevels = ['low', 'medium', 'high'];
            attacks.push({
                id: Date.now() + Math.random() * 1000 + i, // More unique IDs
                source,
                target,
                threatLevel: threatLevels[Math.floor(Math.random() * threatLevels.length)],
                timestamp: new Date().toISOString(),
                duration: 3000 + Math.random() * 2000 // Attack duration for animation
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
