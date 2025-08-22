const express = require('express');
const axios = require('axios');
const geoLocation = require('../data/geolocation');
const threatClassifier = require('../ml/classifier');

const router = express.Router();

// Get current attack data
router.get('/attacks', async (req, res) => {
    try {
        // This would integrate with real Cloudflare/AbuseIPDB APIs
        const attacks = await fetchAttackData();
        res.json({ success: true, data: attacks });
    } catch (error) {
        console.error('Error fetching attacks:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get attack statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            totalAttacks: 1247,
            activeAttacks: 23,
            countries: 45,
            topTargets: [
                { country: 'United States', count: 342 },
                { country: 'Germany', count: 198 },
                { country: 'United Kingdom', count: 156 }
            ],
            topSources: [
                { country: 'China', count: 89 },
                { country: 'Russia', count: 67 },
                { country: 'North Korea', count: 45 }
            ],
            threatLevels: {
                high: 45,
                medium: 123,
                low: 89
            }
        };
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Classify IP threat level
router.post('/classify', async (req, res) => {
    try {
        const { ip, additionalData } = req.body;
        
        if (!ip) {
            return res.status(400).json({ success: false, error: 'IP address required' });
        }
        
        const coordinates = await geoLocation.getCoordinates(ip);
        const threatLevel = await threatClassifier.classifyThreat({
            ip,
            ...additionalData
        });
        
        res.json({
            success: true,
            data: {
                ip,
                coordinates,
                threatLevel: threatLevel.level,
                confidence: threatLevel.confidence,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error classifying IP:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cloudflare API integration
router.get('/cloudflare/logs', async (req, res) => {
    try {
        const apiKey = process.env.CLOUDFLARE_API_KEY;
        const email = process.env.CLOUDFLARE_EMAIL;
        
        if (!apiKey || !email) {
            return res.status(500).json({ 
                success: false, 
                error: 'Cloudflare API credentials not configured' 
            });
        }
        
        // Example Cloudflare API call (replace with actual implementation)
        const response = await axios.get('https://api.cloudflare.com/client/v4/zones', {
            headers: {
                'X-Auth-Email': email,
                'X-Auth-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Cloudflare API error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// AbuseIPDB API integration
router.get('/abuseipdb/:ip', async (req, res) => {
    try {
        const { ip } = req.params;
        const apiKey = process.env.ABUSEIPDB_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ 
                success: false, 
                error: 'AbuseIPDB API key not configured' 
            });
        }
        
        const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
            headers: {
                'Key': apiKey,
                'Accept': 'application/json'
            },
            params: {
                ipAddress: ip,
                maxAgeInDays: 90,
                verbose: ''
            }
        });
        
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('AbuseIPDB API error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

async function fetchAttackData() {
    // Mock implementation - replace with real API integration
    const mockAttacks = [
        {
            id: 1,
            source: { ip: '203.0.113.1', lat: 40.7128, lng: -74.0060, country: 'US' },
            target: { ip: '198.51.100.1', lat: 51.5074, lng: -0.1278, country: 'GB' },
            threatLevel: 'high',
            timestamp: new Date().toISOString()
        },
        {
            id: 2,
            source: { ip: '192.0.2.1', lat: 35.6762, lng: 139.6503, country: 'JP' },
            target: { ip: '203.0.113.5', lat: 52.5200, lng: 13.4050, country: 'DE' },
            threatLevel: 'medium',
            timestamp: new Date().toISOString()
        }
    ];
    
    return mockAttacks;
}

module.exports = router;
