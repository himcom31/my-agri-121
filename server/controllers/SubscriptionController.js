const Razorpay = require('razorpay');
const crypto = require('crypto');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const User = require('../models/User/User');

const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Public — signup screen ke plan cards ke liye
const listPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.findAllActive();
        return res.status(200).json({ success: true, plans });
    } catch (error) {
        console.error('ListPlans error:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Admin CRUD
const createPlan = async (req, res) => {
    try {
        const { name, price, durationDays } = req.body;
        if (!name || !price || !durationDays) {
            return res.status(400).json({ success: false, message: 'name, price aur durationDays required hai.' });
        }
        const plan = await SubscriptionPlan.create({ name, price, durationDays });
        return res.status(201).json({ success: true, plan });
    } catch (error) {
        console.error('CreatePlan error:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

const listAllPlansAdmin = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.findAll();
        return res.status(200).json({ success: true, plans });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

const updatePlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.update(req.params.id, req.body);
        return res.status(200).json({ success: true, plan });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

const deletePlan = async (req, res) => {
    try {
        await SubscriptionPlan.remove(req.params.id);
        return res.status(200).json({ success: true, message: 'Plan deleted.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// User — registration ke baad, plan chunne pe order banega
const createOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user.id;

        const plan = await SubscriptionPlan.findById(planId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({ success: false, message: 'Plan not found.' });
        }

        const amountInPaise = Math.round(Number(plan.price) * 100);

        const order = await razorpay.orders.create({
            amount:   amountInPaise,
            currency: 'INR',
            receipt:  `sub_${userId}_${Date.now()}`,
        });

        await UserSubscription.create({
            userId,
            planId:            plan.id,
            amount:            plan.price,
            razorpay_order_id: order.id,
        });

        return res.status(200).json({
            success:  true,
            orderId:  order.id,
            amount:   order.amount,
            currency: order.currency,
            keyId:    process.env.RAZORPAY_KEY_ID,
            planName: plan.name,
        });
    } catch (error) {
        console.error('CreateOrder error:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// User — payment verify + account activate
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.user.id;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment details missing.' });
        }

        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSign !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed.' });
        }

        const subscription = await UserSubscription.findByOrderId(razorpay_order_id);
        if (!subscription || subscription.user_id !== userId) {
            return res.status(404).json({ success: false, message: 'Subscription record not found.' });
        }

        const plan = await SubscriptionPlan.findById(subscription.plan_id);
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

        await UserSubscription.activate(subscription.id, { razorpay_payment_id, startDate, endDate });

        // ✅ isActive: true — id activate ho gayi
        const updatedUser = await User.findByIdAndUpdate(userId, { isActive: true });

        return res.status(200).json({
            success: true,
            message: 'Payment verified. Account activated!',
            user:    updatedUser,
        });
    } catch (error) {
        console.error('VerifyPayment error:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};
// User ka apna active subscription
const getMySubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const sub = await UserSubscription.getLatestForUser(userId);

        if (!sub) {
            return res.status(200).json({ success: true, subscription: null });
        }

        const plan = await SubscriptionPlan.findById(sub.plan_id);

        const now = new Date();
        const endDate = new Date(sub.endDate);
        const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
        const totalDays = plan?.durationDays || 30;
        const daysUsed = totalDays - daysLeft;
        const progressPct = Math.min(100, Math.round((daysUsed / totalDays) * 100));

        return res.status(200).json({
            success: true,
            subscription: {
                id:          sub.id,
                status:      sub.status,
                planName:    plan?.name || 'Unknown Plan',
                price:       plan?.price || sub.amount,
                durationDays: totalDays,
                startDate:   sub.startDate,
                endDate:     sub.endDate,
                daysLeft,
                progressPct,
                paymentId:   sub.razorpay_payment_id,
            }
        });
    } catch (error) {
        console.error('GetMySubscription error:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = {
    listPlans, createPlan, listAllPlansAdmin,
    updatePlan, deletePlan, createOrder,
    verifyPayment, getMySubscription  // ← add karo
};

