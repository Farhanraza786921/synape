const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SYNAPE EARN Bot System...\n');

// Start the Telegram bot
console.log('📱 Starting Telegram Bot...');
const botProcess = spawn('node', ['bot.js'], {
    cwd: path.join(__dirname, 'bot'),
    stdio: 'inherit'
});

// Start the admin panel
console.log('🖥️  Starting Admin Panel...');
const adminProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'admin'),
    stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down SYNAPE EARN Bot System...');
    
    botProcess.kill('SIGINT');
    adminProcess.kill('SIGINT');
    
    setTimeout(() => {
        process.exit(0);
    }, 2000);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down SYNAPE EARN Bot System...');
    
    botProcess.kill('SIGTERM');
    adminProcess.kill('SIGTERM');
    
    setTimeout(() => {
        process.exit(0);
    }, 2000);
});

// Handle process errors
botProcess.on('error', (error) => {
    console.error('❌ Bot process error:', error);
});

adminProcess.on('error', (error) => {
    console.error('❌ Admin process error:', error);
});

botProcess.on('exit', (code) => {
    console.log(`📱 Bot process exited with code ${code}`);
});

adminProcess.on('exit', (code) => {
    console.log(`🖥️  Admin process exited with code ${code}`);
});

console.log('\n✅ SYNAPE EARN Bot System started successfully!');
console.log('📱 Telegram Bot: Running');
console.log('🖥️  Admin Panel: http://localhost:3001');
console.log('👤 Admin Login: heart / heart');
console.log('\nPress Ctrl+C to stop the system.\n');

