const geoip = require('geoip-lite');

class GeoLocation {
    constructor() {
        // Default coordinates for unknown locations
        this.defaultCoords = {
            lat: 0,
            lng: 0,
            country: 'Unknown',
            city: 'Unknown'
        };
    }

    async getCoordinates(ip) {
        try {
            // Handle localhost and private IPs
            if (this.isPrivateIP(ip)) {
                return {
                    ...this.defaultCoords,
                    lat: 40.7128, // NYC coordinates as default
                    lng: -74.0060,
                    country: 'Local',
                    city: 'Local Network'
                };
            }

            const geo = geoip.lookup(ip);
            
            if (geo) {
                return {
                    lat: geo.ll[0],
                    lng: geo.ll[1],
                    country: geo.country,
                    city: geo.city || 'Unknown',
                    region: geo.region || 'Unknown',
                    timezone: geo.timezone || 'Unknown'
                };
            }

            // Fallback to mock coordinates for demonstration
            return this.getMockCoordinates(ip);
        } catch (error) {
            console.error('Error getting coordinates for IP:', ip, error);
            return this.getMockCoordinates(ip);
        }
    }

    getMockCoordinates(ip) {
        // Generate semi-consistent coordinates based on IP
        const hash = this.hashCode(ip);
        const lat = ((hash % 180) - 90) + (Math.random() - 0.5) * 10;
        const lng = ((hash % 360) - 180) + (Math.random() - 0.5) * 10;
        
        const countries = ['US', 'GB', 'DE', 'JP', 'CN', 'RU', 'FR', 'IT', 'BR', 'IN'];
        const cities = ['New York', 'London', 'Berlin', 'Tokyo', 'Beijing', 'Moscow', 'Paris', 'Rome', 'São Paulo', 'Mumbai'];
        
        const index = Math.abs(hash) % countries.length;
        
        return {
            lat: lat,
            lng: lng,
            country: countries[index],
            city: cities[index],
            region: 'Unknown',
            timezone: 'Unknown'
        };
    }

    isPrivateIP(ip) {
        const privateRanges = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[01])\./,
            /^192\.168\./,
            /^127\./,
            /^localhost$/,
            /^::1$/,
            /^fc00:/,
            /^fe80:/
        ];

        return privateRanges.some(range => range.test(ip));
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    calculateDistance(coord1, coord2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.deg2rad(coord2.lat - coord1.lat);
        const dLng = this.deg2rad(coord2.lng - coord1.lng);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Get coordinates for multiple IPs in batch
    async getMultipleCoordinates(ips) {
        const promises = ips.map(ip => this.getCoordinates(ip));
        return await Promise.all(promises);
    }

    // Get country statistics
    getCountryStats(attacks) {
        const stats = {};
        
        attacks.forEach(attack => {
            const sourceCountry = attack.source.country;
            const targetCountry = attack.target.country;
            
            stats[sourceCountry] = stats[sourceCountry] || { outgoing: 0, incoming: 0 };
            stats[targetCountry] = stats[targetCountry] || { outgoing: 0, incoming: 0 };
            
            stats[sourceCountry].outgoing++;
            stats[targetCountry].incoming++;
        });
        
        return stats;
    }
}

module.exports = new GeoLocation();
