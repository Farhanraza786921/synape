# SYNAPE EARN Bot - Deployment Guide

## cPanel Deployment Instructions

### Prerequisites
- cPanel hosting with Node.js support
- SSH access (recommended) or File Manager access
- Domain or subdomain for admin panel

### Step 1: Upload Files
1. Download and extract the `synape-earn-bot.zip` file
2. Upload all files to your cPanel File Manager or via FTP
3. Place files in your domain's public_html directory or a subdirectory

### Step 2: Install Dependencies
**Option A: Using SSH (Recommended)**
```bash
cd /path/to/your/project
npm run install-all
```

**Option B: Using cPanel Terminal**
1. Open cPanel Terminal
2. Navigate to your project directory
3. Run: `npm run install-all`

### Step 3: Configure Node.js App in cPanel
1. Go to cPanel → Software → Node.js Apps
2. Click "Create App"
3. Set the following:
   - **Node.js Version:** 14.x or higher
   - **Application Mode:** Production
   - **Application Root:** /path/to/your/project
   - **Application URL:** your-domain.com (or subdomain)
   - **Application Startup File:** start.js

### Step 4: Environment Variables (Optional)
In cPanel Node.js App settings, add environment variables:
- `NODE_ENV=production`
- `PORT=3001` (or your preferred port)

### Step 5: Start the Application
1. In cPanel Node.js Apps, click "Start App"
2. The bot and admin panel will start automatically

### Step 6: Access Points
- **Admin Panel:** https://your-domain.com:3001
- **Telegram Bot:** https://t.me/synapeearn_bot
- **Channel:** https://t.me/synape

### Step 7: SSL Certificate (Recommended)
1. Enable SSL in cPanel for secure admin panel access
2. Update any hardcoded URLs to use HTTPS

## Alternative Deployment Methods

### VPS/Dedicated Server
```bash
# Clone or upload files
cd /path/to/project

# Install dependencies
npm run install-all

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start start.js --name "synape-earn-bot"
pm2 startup
pm2 save

# Setup reverse proxy (Nginx example)
# Add to Nginx config:
location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Heroku Deployment
1. Create a Heroku app
2. Add the following to `package.json` scripts:
   ```json
   "scripts": {
     "start": "node start.js",
     "heroku-postbuild": "npm run install-all"
   }
   ```
3. Set environment variables in Heroku dashboard
4. Deploy using Git or Heroku CLI

## Troubleshooting

### Common Issues

**1. Bot not responding:**
- Check bot token in config.js
- Ensure bot is started with `/start` command
- Verify channel permissions

**2. Admin panel not accessible:**
- Check if port 3001 is open
- Verify server is running: `ps aux | grep node`
- Check firewall settings

**3. Channel verification failing:**
- Ensure bot is admin in the channel
- Check channel username in config.js
- Verify channel is public or bot has access

**4. Dependencies not installing:**
- Check Node.js version (14+ required)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall

### Logs and Monitoring
- Check console output for errors
- Monitor server resources
- Set up log rotation for production

### Security Recommendations
1. Change default admin credentials
2. Use environment variables for sensitive data
3. Enable HTTPS for admin panel
4. Regular security updates
5. Monitor for suspicious activity

### Support
For technical support or customization:
- Check README.md for basic troubleshooting
- Review console logs for error messages
- Ensure all dependencies are properly installed

---

**SYNAPE EARN Bot System v1.0**  
*Ready for Production Deployment*

