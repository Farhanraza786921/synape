const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Initialize bot
const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

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

function createUser(telegramId, username, firstName, lastName, referredBy = null) {
  const users = loadUsers();
  const referralCode = generateReferralCode(telegramId);
  
  const newUser = {
    telegramId,
    username: username || '',
    firstName: firstName || '',
    lastName: lastName || '',
    referralCode,
    referredBy,
    referredUsers: [],
    walletBalance: 0,
    upiId: '',
    joinedAt: new Date().toISOString(),
    isActive: true,
    withdrawalRequests: []
  };
  
  users.push(newUser);
  
  // If user was referred, add reward to referrer
  if (referredBy) {
    const referrer = users.find(u => u.referralCode === referredBy);
    if (referrer && referrer.telegramId !== telegramId) {
      referrer.referredUsers.push(telegramId);
      referrer.walletBalance += config.REFERRAL_REWARD;
    }
  }
  
  saveUsers(users);
  return newUser;
}

function generateReferralCode(telegramId) {
  return `REF${telegramId}${Date.now().toString().slice(-4)}`;
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

// Check if user is member of channel
async function checkChannelMembership(userId) {
  try {
    const member = await bot.getChatMember(config.CHANNEL_ID, userId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch (error) {
    console.error('Error checking channel membership:', error);
    return false;
  }
}

// Keyboard layouts
function getMainKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '🔗 Get Referral Link' }, { text: '💰 Wallet' }],
        [{ text: '💳 Set UPI ID' }, { text: '📖 How to Use Bot' }]
      ],
      resize_keyboard: true,
      persistent: true
    }
  };
}

function getVerificationKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Verify', callback_data: 'verify_membership' }],
        [{ text: '📢 Join Channel', url: 'https://t.me/synape' }]
      ]
    }
  };
}

function getWithdrawKeyboard(canWithdraw) {
  if (canWithdraw) {
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💸 Withdraw', callback_data: 'withdraw_request' }]
        ]
      }
    };
  }
  return {};
}

// Bot event handlers
bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name;
  
  // Extract referral code from start parameter
  const referralCode = match[1] ? match[1].trim() : null;
  
  let user = findUser(userId);
  
  if (!user) {
    // Check channel membership first
    const isMember = await checkChannelMembership(userId);
    
    if (!isMember) {
      return bot.sendMessage(chatId, config.MESSAGES.WELCOME + '\n\n' + config.MESSAGES.JOIN_CHANNEL, getVerificationKeyboard());
    }
    
    // Create new user
    user = createUser(userId, username, firstName, lastName, referralCode);
    bot.sendMessage(chatId, config.MESSAGES.VERIFICATION_SUCCESS);
  }
  
  // Send main menu
  bot.sendMessage(chatId, config.MESSAGES.MAIN_MENU, getMainKeyboard());
});

// Handle callback queries
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;
  
  if (data === 'verify_membership') {
    const isMember = await checkChannelMembership(userId);
    
    if (isMember) {
      let user = findUser(userId);
      if (!user) {
        user = createUser(userId, callbackQuery.from.username, callbackQuery.from.first_name, callbackQuery.from.last_name);
      }
      
      bot.editMessageText(config.MESSAGES.VERIFICATION_SUCCESS, {
        chat_id: chatId,
        message_id: message.message_id
      });
      
      setTimeout(() => {
        bot.sendMessage(chatId, config.MESSAGES.MAIN_MENU, getMainKeyboard());
      }, 1000);
    } else {
      bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Please join the channel first!',
        show_alert: true
      });
    }
  }
  
  if (data === 'withdraw_request') {
    const user = findUser(userId);
    if (!user) return;
    
    if (!user.upiId) {
      return bot.answerCallbackQuery(callbackQuery.id, {
        text: config.MESSAGES.NO_UPI,
        show_alert: true
      });
    }
    
    if (user.walletBalance < config.MIN_WITHDRAWAL) {
      return bot.answerCallbackQuery(callbackQuery.id, {
        text: config.MESSAGES.INSUFFICIENT_BALANCE,
        show_alert: true
      });
    }
    
    // Create withdrawal request
    const withdrawalRequest = {
      id: Date.now(),
      amount: user.walletBalance,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    user.withdrawalRequests.push(withdrawalRequest);
    updateUser(userId, user);
    
    bot.answerCallbackQuery(callbackQuery.id, {
      text: config.MESSAGES.WITHDRAWAL_REQUEST.replace('{amount}', user.walletBalance),
      show_alert: true
    });
  }
});

// Handle text messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  if (!text || text.startsWith('/')) return;
  
  const user = findUser(userId);
  if (!user) {
    return bot.sendMessage(chatId, 'Please start the bot first by typing /start');
  }
  
  // Handle UPI ID input
  if (user.awaitingUpiId) {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (upiRegex.test(text)) {
      updateUser(userId, { upiId: text, awaitingUpiId: false });
      bot.sendMessage(chatId, config.MESSAGES.UPI_UPDATED, getMainKeyboard());
    } else {
      bot.sendMessage(chatId, '❌ Invalid UPI ID format. Please enter a valid UPI ID (e.g., yourname@paytm):');
    }
    return;
  }
  
  // Handle menu options
  switch (text) {
    case '🔗 Get Referral Link':
      const referralLink = `https://t.me/${config.BOT_USERNAME}?start=${user.referralCode}`;
      bot.sendMessage(chatId, config.MESSAGES.REFERRAL_LINK.replace('{link}', referralLink));
      break;
      
    case '💰 Wallet':
      const canWithdraw = user.walletBalance >= config.MIN_WITHDRAWAL && user.upiId;
      const withdrawButton = canWithdraw ? '\n\n💸 Click below to withdraw:' : 
        user.walletBalance < config.MIN_WITHDRAWAL ? 
        `\n\n💡 Minimum withdrawal: ₹${config.MIN_WITHDRAWAL}` : 
        '\n\n💡 Set UPI ID to enable withdrawal';
      
      const walletMessage = config.MESSAGES.WALLET_INFO
        .replace('{referrals}', user.referredUsers.length)
        .replace('{balance}', user.walletBalance)
        .replace('{withdraw_button}', withdrawButton);
      
      bot.sendMessage(chatId, walletMessage, getWithdrawKeyboard(canWithdraw));
      break;
      
    case '💳 Set UPI ID':
      updateUser(userId, { awaitingUpiId: true });
      const currentUpi = user.upiId ? `\n\nCurrent UPI ID: ${user.upiId}` : '';
      bot.sendMessage(chatId, config.MESSAGES.UPI_SET + currentUpi);
      break;
      
    case '📖 How to Use Bot':
      bot.sendMessage(chatId, config.MESSAGES.HOW_TO_USE);
      break;
      
    default:
      bot.sendMessage(chatId, 'Please use the menu buttons below:', getMainKeyboard());
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('🤖 SYNAPE EARN Bot is running...');
console.log(`📢 Channel: ${config.CHANNEL_USERNAME}`);
console.log(`💰 Referral Reward: ₹${config.REFERRAL_REWARD}`);
console.log(`💸 Min Withdrawal: ₹${config.MIN_WITHDRAWAL}`);

