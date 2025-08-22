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

// Simulate attack data generation (replace with real API data)
setInterval(async () => {
    try {
        const mockAttack = await generateMockAttack();
        broadcastAttackData(mockAttack);
    } catch (error) {
        console.error('Error generating mock attack:', error);
    }
}, 2000); // Generate attack every 2 seconds

async function generateMockAttack() {
    // Mock IPs for demonstration
    const mockIPs = [
        '192.168.1.1', '203.0.113.1', '198.51.100.1', '8.8.8.8',
        '1.1.1.1', '173.252.95.1', '172.217.12.142', '93.184.216.34'
    ];
    
    const sourceIP = mockIPs[Math.floor(Math.random() * mockIPs.length)];
    const targetIP = mockIPs[Math.floor(Math.random() * mockIPs.length)];
    
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
