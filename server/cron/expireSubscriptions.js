const cron = require('node-cron');
const UserSubscription = require('../models/UserSubscription');
const User = require('../models/User/User');

const runExpiryCheck = async () => {
    try {
        const overdue = await UserSubscription.findOverdueActive();
        if (!overdue.length) return;

        await UserSubscription.markExpiredByIds(overdue.map(s => s.id));

        for (const sub of overdue) {
            await User.findByIdAndUpdate(sub.user_id, { isActive: false });
        }

        console.log(`⏰ Expired ${overdue.length} subscription(s), deactivated matching users.`);
    } catch (error) {
        console.error('Subscription expiry cron error:', error);
    }
};

// Har raat 12:05 AM IST pe chalega
const startExpiryCron = () => {
    cron.schedule('5 0 * * *', runExpiryCheck, { timezone: 'Asia/Kolkata' });
    console.log('✅ Subscription expiry cron scheduled (daily 12:05 AM IST)');
};

module.exports = { startExpiryCron, runExpiryCheck };