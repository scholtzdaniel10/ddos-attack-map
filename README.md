# 3D DDoS Attack Visualization Map

A real-time 3D globe visualization of DDoS attacks using data from Cloudflare and AbuseIPDB APIs, with machine learning-based threat classification. Built with React and Three.js.

## Features

- **3D Globe Visualization**: Interactive React Three Fiber-powered globe showing real-time attack data
- **IP Geolocation**: Converts IP addresses to geographical coordinates
- **ML Threat Classification**: Uses machine learning to classify attacks as malicious or test traffic
- **Color-Coded Visualization**: Attack lines are colored based on threat level:
  - 🔴 Red: High-threat malicious attacks
  - 🟡 Yellow: Medium-threat suspicious activity
  - 🟢 Green: Low-threat or test traffic
- **Real-time Data**: Integrates with Cloudflare and AbuseIPDB APIs
- **Interactive Controls**: Zoom, rotate, and explore the globe
- **Responsive React UI**: Modern component-based interface

## Tech Stack

- **Frontend**: React, React Three Fiber, Styled Components
- **Backend**: Node.js, Express, WebSockets
- **3D Graphics**: Three.js via React Three Fiber
- **Machine Learning**: Python, Scikit-learn
- **APIs**: Cloudflare API, AbuseIPDB API

## Setup

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+ (for ML components)
- API keys for Cloudflare and AbuseIPDB

### Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Add your API keys to `.env`:
```
CLOUDFLARE_API_KEY=your_cloudflare_key
CLOUDFLARE_EMAIL=your_email
ABUSEIPDB_API_KEY=your_abuseipdb_key
PORT=3000
```

4. Install Python dependencies (optional, for ML training):
```bash
pip install -r requirements.txt
```

5. Train the ML model (optional, pre-trained model included):
```bash
npm run ml-train
```

### Running the Application

Development mode (runs both server and React client):
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3000`
- React development server on `http://localhost:3001`

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

- `GET /api/attacks` - Get current attack data
- `GET /api/stats` - Get attack statistics
- `POST /api/classify` - Classify an IP address threat level
- `GET /api/cloudflare/logs` - Get Cloudflare logs
- `GET /api/abuseipdb/:ip` - Check IP reputation with AbuseIPDB

## Project Structure

```
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   └── App.js         # Main React app
├── server.js              # Express server
├── api/                   # API routes and logic
├── ml/                    # Machine learning components
├── data/                  # Data processing utilities
└── config/                # Configuration files
```

## Deployment to Vercel

### Quick Deploy
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will automatically detect the configuration and deploy

### Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Follow the prompts to configure your deployment
```

### Environment Variables
Set these in your Vercel dashboard:
```
CLOUDFLARE_API_KEY=your_cloudflare_key
CLOUDFLARE_EMAIL=your_email
ABUSEIPDB_API_KEY=your_abuseipdb_key
NODE_ENV=production
```

## Mobile Optimization

The app is fully optimized for mobile devices with:
- 📱 **Responsive UI**: Adaptive layout for mobile screens
- 🎮 **Touch Controls**: Optimized touch interactions for 3D globe
- ⚡ **Performance**: Reduced geometry and effects for better mobile performance
- 📊 **Mobile Panel**: Collapsible stats and controls panel
- 🔄 **Reduced Motion**: Respects user motion preferences

### Mobile Features
- Touch-friendly navigation
- Reduced particle count for better performance
- Simplified wireframe rendering
- Optimized attack line rendering
- Mobile-specific control panel
