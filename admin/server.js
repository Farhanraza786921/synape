const express = require('express');
const cors = require('cors');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'synape-earn-admin-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Data management functions
function loadUsers() {
    try {
        const data = fs.readFileSync(path.join(__dirname, config.USERS_FILE), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(path.join(__dirname, config.USERS_FILE), JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

function findUser(telegramId) {
    const users = loadUsers();
    return users.find(user => user.telegramId === telegramId);
}

function updateUser(telegramId, updates) {
    const users = loadUsers();
    const userIndex = users.findIndex(user => user.telegramId === telegramId);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        saveUsers(users);
        return users[userIndex];
    }
    return null;
}

function getAllWithdrawalRequests() {
    const users = loadUsers();
    const withdrawals = [];
    
    users.forEach(user => {
        if (user.withdrawalRequests && user.withdrawalRequests.length > 0) {
            user.withdrawalRequests.forEach(withdrawal => {
                withdrawals.push({
                    ...withdrawal,
                    telegramId: user.telegramId,
                    userName: `${user.firstName} ${user.lastName}`.trim(),
                    upiId: user.upiId
                });
            });
        }
    });
    
    // Sort by request date (newest first)
    return withdrawals.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.isLoggedIn) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Authentication required' });
    }
}

// Routes

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === config.ADMIN_USERNAME && password === config.ADMIN_PASSWORD) {
        req.session.isLoggedIn = true;
        req.session.username = username;
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Logout failed' });
        } else {
            res.json({ success: true, message: 'Logout successful' });
        }
    });
});

// Get admin data
app.get('/api/admin/data', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const withdrawalRequests = getAllWithdrawalRequests();
        
        res.json({
            success: true,
            users,
            withdrawalRequests
        });
    } catch (error) {
        console.error('Error loading admin data:', error);
        res.status(500).json({ success: false, message: 'Error loading data' });
    }
});

// Update user
app.post('/api/admin/update-user', requireAuth, (req, res) => {
    try {
        const { telegramId, walletBalance, upiId } = req.body;
        
        const updatedUser = updateUser(telegramId, {
            walletBalance: parseFloat(walletBalance) || 0,
            upiId: upiId || ''
        });
        
        if (updatedUser) {
            res.json({ success: true, message: 'User updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
});

// Toggle user status
app.post('/api/admin/toggle-user-status', requireAuth, (req, res) => {
    try {
        const { telegramId } = req.body;
        const user = findUser(telegramId);
        
        if (user) {
            const updatedUser = updateUser(telegramId, {
                isActive: !user.isActive
            });
            
            res.json({ success: true, message: 'User status updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ success: false, message: 'Error updating user status' });
    }
});

// Approve withdrawal
app.post('/api/admin/approve-withdrawal', requireAuth, (req, res) => {
    try {
        const { withdrawalId, telegramId } = req.body;
        const user = findUser(telegramId);
        
        if (user) {
            const withdrawalIndex = user.withdrawalRequests.findIndex(w => w.id === withdrawalId);
            
            if (withdrawalIndex !== -1) {
                // Update withdrawal status
                user.withdrawalRequests[withdrawalIndex].status = 'approved';
                user.withdrawalRequests[withdrawalIndex].processedAt = new Date().toISOString();
                
                // Deduct amount from wallet
                user.walletBalance = Math.max(0, user.walletBalance - user.withdrawalRequests[withdrawalIndex].amount);
                
                updateUser(telegramId, user);
                
                res.json({ success: true, message: 'Withdrawal approved successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Withdrawal request not found' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        res.status(500).json({ success: false, message: 'Error approving withdrawal' });
    }
});

// Reject withdrawal
app.post('/api/admin/reject-withdrawal', requireAuth, (req, res) => {
    try {
        const { withdrawalId, telegramId } = req.body;
        const user = findUser(telegramId);
        
        if (user) {
            const withdrawalIndex = user.withdrawalRequests.findIndex(w => w.id === withdrawalId);
            
            if (withdrawalIndex !== -1) {
                // Update withdrawal status
                user.withdrawalRequests[withdrawalIndex].status = 'rejected';
                user.withdrawalRequests[withdrawalIndex].processedAt = new Date().toISOString();
                
                updateUser(telegramId, user);
                
                res.json({ success: true, message: 'Withdrawal rejected successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Withdrawal request not found' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        res.status(500).json({ success: false, message: 'Error rejecting withdrawal' });
    }
});

// Get statistics
app.get('/api/admin/stats', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const withdrawalRequests = getAllWithdrawalRequests();
        
        const stats = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isActive).length,
            totalEarnings: users.reduce((sum, u) => sum + u.walletBalance, 0),
            pendingWithdrawals: withdrawalRequests.filter(w => w.status === 'pending').length,
            totalReferrals: users.reduce((sum, u) => sum + u.referredUsers.length, 0),
            totalWithdrawalAmount: withdrawalRequests
                .filter(w => w.status === 'approved')
                .reduce((sum, w) => sum + w.amount, 0)
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ success: false, message: 'Error getting statistics' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'SYNAPE EARN Admin Panel is running',
        timestamp: new Date().toISOString()
    });
});

// Serve admin panel for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// Start server
const PORT = process.env.PORT || config.ADMIN_PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SYNAPE EARN Admin Panel running on port ${PORT}`);
    console.log(`📊 Admin URL: http://localhost:${PORT}`);
    console.log(`👤 Admin Username: ${config.ADMIN_USERNAME}`);
    console.log(`🔑 Admin Password: ${config.ADMIN_PASSWORD}`);
});

module.exports = app;

