module.exports = {
  // Bot Configuration
  BOT_TOKEN: '7642601533:AAEyv_A3WxID7p2sGpET7TazuDxSqR9mB_Y',
  BOT_USERNAME: 'synapeearn_bot',
  
  // Channel Configuration
  CHANNEL_USERNAME: '@synape',
  CHANNEL_ID: '@synape', // Will be used for checking membership
  
  // Admin Configuration
  ADMIN_USERNAME: 'heart',
  ADMIN_PASSWORD: 'heart',
  
  // Bot Settings
  REFERRAL_REWARD: 5, // ₹5 per referral
  MIN_WITHDRAWAL: 300, // ₹300 minimum withdrawal
  
  // Server Configuration
  BOT_PORT: 3000,
  ADMIN_PORT: 3001,
  
  // Data Files
  USERS_FILE: '../data/users.json',
  
  // Bot Messages
  MESSAGES: {
    WELCOME: '🎉 Welcome to SYNAPE EARN Bot!\n\nTo get started, you need to join our channel first.',
    JOIN_CHANNEL: '📢 Please join our channel to continue:\n\n👉 @synape\n\nAfter joining, click "✅ Verify" to proceed.',
    VERIFICATION_SUCCESS: '✅ Great! You have successfully joined our channel.\n\nNow you can start earning with SYNAPE EARN!',
    VERIFICATION_FAILED: '❌ You haven\'t joined our channel yet. Please join @synape and try again.',
    MAIN_MENU: '🏠 Main Menu\n\nChoose an option below:',
    REFERRAL_LINK: '🔗 Your Referral Link:\n\n{link}\n\n📤 Share this link with your friends and earn ₹5 for each successful referral!',
    WALLET_INFO: '💰 Your Wallet\n\n👥 Total Referrals: {referrals}\n💵 Total Earned: ₹{balance}\n\n{withdraw_button}',
    UPI_SET: '💳 UPI ID Setup\n\nPlease send your UPI ID (e.g., yourname@paytm):',
    UPI_UPDATED: '✅ Your UPI ID has been updated successfully!',
    HOW_TO_USE: '📖 How to Use SYNAPE EARN Bot\n\n1️⃣ Get your referral link\n2️⃣ Share with friends\n3️⃣ Earn ₹5 per referral\n4️⃣ Withdraw when balance ≥ ₹300\n5️⃣ Set your UPI ID for payouts\n\n💡 Tips:\n• Share your link on social media\n• Tell friends about earning opportunities\n• Check your wallet regularly',
    WITHDRAWAL_REQUEST: '💸 Withdrawal Request\n\nYour withdrawal request for ₹{amount} has been submitted.\n\nAdmin will review and process it soon.',
    INSUFFICIENT_BALANCE: '❌ Insufficient balance. Minimum withdrawal amount is ₹300.',
    NO_UPI: '❌ Please set your UPI ID first before requesting withdrawal.'
  }
};

