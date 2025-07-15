# SYNAPE EARN - Telegram Bot System

A complete Telegram bot system with referral functionality and admin panel for managing users and withdrawals.

## Features

✅ **Telegram Bot Features:**
- Channel subscription verification
- Referral system with ₹5 per referral
- Wallet management with ₹300 minimum withdrawal
- UPI ID setup for payouts
- User-friendly interface with inline keyboards

✅ **Admin Panel Features:**
- Secure admin login (Username: heart, Password: heart)
- User management and statistics
- Withdrawal request approval/rejection
- Real-time data updates
- Responsive design with Tailwind CSS

## Project Structure

```
synape-earn-bot/
├── bot/                    # Telegram bot files
│   ├── bot.js             # Main bot logic
│   ├── package.json       # Bot dependencies
│   └── node_modules/      # Bot dependencies
├── admin/                 # Admin panel files
│   ├── server.js          # Express.js backend
│   ├── package.json       # Admin dependencies
│   ├── public/            # Frontend files
│   │   └── index.html     # Admin panel UI
│   └── node_modules/      # Admin dependencies
├── data/                  # Data storage
│   └── users.json         # User data (JSON database)
├── config.js              # Configuration file
├── start.js               # System startup script
├── package.json           # Main package file
└── README.md              # This file
```

## Installation

### 1. Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### 2. Install Dependencies
```bash
# Install dependencies for both bot and admin
npm run install-all
```

### 3. Configuration
The bot is pre-configured with the provided settings:
- **Bot Token:** 7642601533:AAEyv_A3WxID7p2sGpET7TazuDxSqR9mB_Y
- **Bot Username:** @synapeearn_bot
- **Channel:** @synape
- **Admin Username:** heart
- **Admin Password:** heart

## Running the System

### Local Development
```bash
# Start both bot and admin panel
npm start

# Or start individually:
npm run bot    # Start only the bot
npm run admin  # Start only the admin panel
```

### Production Deployment

#### Option 1: cPanel Deployment
1. Upload the entire project folder to your cPanel file manager
2. Navigate to the project directory in cPanel Terminal
3. Run: `npm run install-all`
4. Run: `npm start`
5. Set up a subdomain or use the main domain to access the admin panel

#### Option 2: VPS/Server Deployment
1. Upload files to your server
2. Install dependencies: `npm run install-all`
3. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start start.js --name "synape-earn-bot"
   pm2 startup
   pm2 save
   ```

## Access Points

- **Telegram Bot:** https://t.me/synapeearn_bot
- **Admin Panel:** http://your-domain:3001 (or configured port)
- **Channel:** https://t.me/synape

## Admin Panel Login

- **Username:** heart
- **Password:** heart

## Bot Commands

- `/start` - Start the bot and join verification
- `/start REF123456` - Start with referral code

## Bot Menu Options

1. **🔗 Get Referral Link** - Generate and share referral link
2. **💰 Wallet** - View balance and withdrawal options
3. **💳 Set UPI ID** - Configure UPI for withdrawals
4. **📖 How to Use Bot** - Instructions and help

## Data Storage

The system uses JSON files for data storage:
- `data/users.json` - User information, balances, and referrals

## Security Features

- Channel membership verification
- Admin authentication
- Session management
- Input validation
- Referral fraud prevention

## Customization

### Changing Bot Settings
Edit `config.js` to modify:
- Referral rewards
- Minimum withdrawal amount
- Bot messages
- Admin credentials

### Styling the Admin Panel
The admin panel uses Tailwind CSS. Modify `admin/public/index.html` to customize the design.

## Troubleshooting

### Common Issues

1. **Bot not responding:**
   - Check bot token in config.js
   - Ensure bot is started with `/start` command

2. **Admin panel not loading:**
   - Check if port 3001 is available
   - Verify admin server is running

3. **Channel verification failing:**
   - Ensure bot is admin in the channel
   - Check channel username in config

### Logs
Check console output for error messages and debugging information.

## Support

For technical support or customization requests, please contact the development team.

## License

This project is licensed under the MIT License.

---

**SYNAPE EARN Bot System v1.0**  
*Complete Telegram Bot Solution with Admin Panel*

