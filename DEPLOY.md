# 🚀 Deployment Guide for Vercel

## Quick Deploy Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: 3D DDoS Attack Map with mobile optimization"
git branch -M main
git remote add origin https://github.com/yourusername/ddos-attack-map.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select your repository
5. Vercel will auto-detect the React app and deploy

### 3. Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:
```
CLOUDFLARE_API_KEY=your_key_here
CLOUDFLARE_EMAIL=your_email_here
ABUSEIPDB_API_KEY=your_key_here
NODE_ENV=production
```

## Mobile Optimizations ✅

Your app is now fully mobile-optimized with:

### 📱 **Responsive Design**
- Mobile-first layout that adapts to screen size
- Touch-friendly navigation controls
- Collapsible mobile control panel

### ⚡ **Performance Optimizations**
- Reduced polygon count on mobile (32 vs 64 segments)
- Limited attack visualization (20 vs 50 attacks)
- Optimized texture rendering for mobile GPUs
- Reduced particle effects for better framerate

### 🎮 **Touch Controls**
- Optimized Three.js OrbitControls for touch
- Pinch to zoom, drag to rotate
- Touch-friendly button sizes (44px minimum)
- Disabled text selection and highlight

### 🎯 **Mobile-Specific Features**
- Hamburger menu for mobile controls
- Condensed header layout
- Full-screen mobile panels
- Reduced motion for better performance

## Vercel Configuration

The app includes:
- ✅ `vercel.json` - Deployment configuration
- ✅ Static build optimization
- ✅ API routes handling
- ✅ Environment variable support
- ✅ PWA capabilities

## Performance Tips

### For Mobile Users:
- Reduced attack line complexity
- Simplified globe rendering
- Touch-optimized controls
- Faster loading times

### For Desktop Users:
- Full 3D effects and details
- More concurrent attack visualizations
- Enhanced visual effects
- Detailed side panels

## Deploy Command
```bash
# Manual deploy with Vercel CLI
npm i -g vercel
vercel --prod
```

## Success! 🎉

Your 3D DDoS Attack Map is now:
- ✅ Mobile-optimized
- ✅ Ready for Vercel deployment
- ✅ PWA-capable
- ✅ Production-ready

The app will automatically detect mobile devices and optimize the experience accordingly!
