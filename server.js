const express = require('express');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const attackRoutes = require('./api/attacks');
const geoLocation = require('./data/geolocation');
const threatClassifier = require('./ml/classifier');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
} else {
    app.use(express.static('public'));
}

// API Routes
app.use('/api', attackRoutes);

// Serve React app
app.get('/', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
        console.log('Received:', message.toString());
    });
    
    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
    });
});

// Broadcast attack data to all connected clients
function broadcastAttackData(attackData) {
    const message = JSON.stringify({
        type: 'attack',
        data: attackData
    });
    
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Simulate attack data generation with high activity
// Generate multiple attacks simultaneously for very active visualization
setInterval(async () => {
    try {
        // Generate 3-5 attacks at once for high activity
        const numAttacks = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < numAttacks; i++) {
            const mockAttack = await generateMockAttack();
            broadcastAttackData(mockAttack);
            // Small delay between attacks for visual effect
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    } catch (error) {
        console.error('Error generating mock attack:', error);
    }
}, 500); // Generate attacks every 500ms for very active visualization

async function generateMockAttack() {
    // Extensive list of IPs from around the world for high activity visualization
    const mockIPs = [
        // North America
        '8.8.8.8', '1.1.1.1', '4.2.2.2', '208.67.222.222', '9.9.9.9',
        '64.6.64.6', '77.88.8.8', '156.154.70.1', '198.51.100.1',
        '192.0.2.1', '203.0.113.1', '172.217.12.142', '173.252.95.1',
        
        // Europe
        '8.8.4.4', '1.0.0.1', '208.67.220.220', '84.200.69.80', '94.140.14.14',
        '185.228.168.9', '45.90.28.250', '176.103.130.130', '80.80.80.80',
        '37.235.1.174', '193.17.47.1', '149.112.112.112',
        
        // Asia
        '114.114.114.114', '223.5.5.5', '180.76.76.76', '119.29.29.29',
        '182.254.116.116', '101.226.4.6', '218.102.23.228', '168.95.1.1',
        '203.80.96.10', '210.2.4.8', '103.86.96.100', '203.198.7.66',
        
        // Australia/Oceania
        '1.1.1.3', '103.2.57.5', '139.130.4.5', '202.14.67.4',
        '203.50.2.71', '210.48.77.68', '202.131.252.251',
        
        // South America
        '200.160.2.3', '189.38.95.95', '177.54.152.99', '201.131.4.5',
        '186.251.103.6', '200.248.178.54', '181.192.2.23',
        
        // Africa
        '196.216.2.5', '41.203.252.5', '197.221.243.8', '105.235.222.41',
        '154.0.174.56', '196.49.12.14', '41.57.120.23',
        
        // Additional random IPs for variety
        '93.184.216.34', '151.101.193.140', '104.16.249.249', '13.107.42.14',
        '52.84.124.144', '54.230.87.134', '23.185.0.142', '199.59.243.120',
        '198.252.206.25', '185.199.108.153', '140.82.112.25', '72.21.91.29'
    ];
    
    const sourceIP = mockIPs[Math.floor(Math.random() * mockIPs.length)];
    let targetIP = mockIPs[Math.floor(Math.random() * mockIPs.length)];
    
    // Ensure source and target are different
    while (targetIP === sourceIP) {
        targetIP = mockIPs[Math.floor(Math.random() * mockIPs.length)];
    }
    
    const sourceCoords = await geoLocation.getCoordinates(sourceIP);
    const targetCoords = await geoLocation.getCoordinates(targetIP);
    
    const threatLevel = await threatClassifier.classifyThreat({
        sourceIP,
        targetIP,
        packetSize: Math.floor(Math.random() * 1500),
        frequency: Math.floor(Math.random() * 1000)
    });
    
    return {
        id: Date.now() + Math.random(),
        source: {
            ip: sourceIP,
            coordinates: sourceCoords,
            country: sourceCoords.country || 'Unknown'
        },
        target: {
            ip: targetIP,
            coordinates: targetCoords,
            country: targetCoords.country || 'Unknown'
        },
        threatLevel: threatLevel.level,
        confidence: threatLevel.confidence,
        timestamp: new Date().toISOString(),
        attackType: 'DDoS',
        intensity: Math.floor(Math.random() * 100) + 1
    };
}

server.listen(PORT, () => {
    console.log(`DDoS Attack Map server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to view the visualization`);
});

module.exports = { app, server, broadcastAttackData };
