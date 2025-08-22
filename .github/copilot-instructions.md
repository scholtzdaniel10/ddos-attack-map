<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 3D DDoS Attack Visualization Map

This project creates a real-time 3D globe visualization of DDoS attacks using data from Cloudflare and AbuseIPDB APIs, with machine learning-based threat classification.

## Project Structure
- Frontend: React with React Three Fiber for 3D globe rendering
- Backend: Node.js/Express for API integration and data processing
- ML: Python/Scikit-learn for threat classification
- APIs: Cloudflare and AbuseIPDB integration
- Geolocation: IP to coordinates conversion

## Key Features
- Real-time 3D globe with attack visualization using React Three Fiber
- IP geolocation and coordinate mapping
- Color-coded attack lines based on ML threat assessment
- Integration with Cloudflare and AbuseIPDB APIs
- Machine learning threat classification (malicious vs test attacks)
- Modern React component architecture with Context API
- WebSocket real-time communication

## Development Guidelines
- Use React functional components with hooks
- Implement proper error handling for API calls
- Follow security best practices for API key management
- Optimize 3D rendering performance with React Three Fiber
- Use styled-components for component styling
- Implement responsive design for various screen sizes
- Use React Context for state management
