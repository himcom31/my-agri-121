const jwt = require('jsonwebtoken');
const User = require('../../models/User/User');
const UserSubscription = require('../../models/UserSubscription'); // ⚠️ path apni actual folder structure ke hisaab se confirm kar lein
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ── Helper: generate JWT ──────────────────────────────────────────────────
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '365d' }
    );
};

// ── Helper: strip sensitive fields ───────────────────────────────────────
const sanitizeUser = (user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    country: user.country,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
});

// ── Register ──────────────────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { fullName, country, phone, email, password } = req.body;

        if (!fullName || !country || !phone || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: fullName, country, phone, email, password.',
            });
        }

        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        const phoneExists = await User.findOne({ phone: phone.replace(/\D/g, '') });
        if (phoneExists) {
            return res.status(409).json({
                success: false,
                message: 'An account with this phone number already exists.',
            });
        }

        // Account is inactive until plan purchase is complete
        const user = await User.create({
            fullName,
            country,
            phone: phone.replace(/\D/g, ''),
            email,
            password,
            isActive: false,
        });

        const token = generateToken(user.id);

        // Send welcome email with login credentials
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,   // smtp.hostinger.com
                port: parseInt(process.env.EMAIL_PORT), // 465
                secure: true,                     // true for port 465
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: `"Maharashtra Bazaar" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Welcome to Maharashtra Bazaar — Your Account Details',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">

                        <h2 style="color: #16a34a; margin-bottom: 4px;">Maharashtra Bazaar</h2>

                        <p style="color: #374151;">Hi <strong>${fullName}</strong>, welcome to Maharashtra Bazaar! 🎉</p>
                        <p style="color: #374151;">Your account has been successfully created. Below are your login credentials:</p>

                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 120px;">Full Name</td>
                                    <td style="padding: 6px 0; color: #111; font-weight: 700; font-size: 13px;">${fullName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Email</td>
                                    <td style="padding: 6px 0; color: #111; font-weight: 700; font-size: 13px;">${email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Phone</td>
                                    <td style="padding: 6px 0; color: #111; font-weight: 700; font-size: 13px;">${phone}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Password</td>
                                    <td style="padding: 6px 0; color: #111; font-weight: 700; font-size: 13px;">${password}</td>
                                </tr>
                            </table>
                        </div>

                        <p style="color: #374151; font-size: 13px;">
                            To activate your account, please log in and complete your subscription plan purchase.
                        </p>

                        <p style="color: #ef4444; font-size: 13px;">
                            ⚠️ Do not share your password with anyone. We recommend changing it after your first login.
                        </p>

                        <a href="${process.env.FRONTEND_URL}"
                           style="display: inline-block; margin: 10px 0 20px; padding: 12px 28px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 14px;">
                            Visit Website
                        </a>

                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                        <p style="color: #9ca3af; font-size: 12px;">
                            © Maharashtra Bazaar. If you did not create this account, please ignore this email or contact support.
                        </p>
                    </div>
                `,
            });
        } catch (emailErr) {
            // Do not block registration if email fails — just log the error
            console.error('Welcome email send failed:', emailErr.message);
        }

        return res.status(201).json({
            success: true,
            message: 'Account created successfully. Please select a plan to activate it.',
            token,
            user: sanitizeUser(user),
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Email or phone already exists.' });
        }
        console.error('Register error:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// ── Login ─────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/phone and password are required.',
            });
        }

        const isEmail = identifier.includes('@');
        const filter = isEmail
            ? { email: identifier.toLowerCase().trim() }
            : { phone: identifier.replace(/\D/g, '') };
        // includePassword: true — password excluded by default in findOne
        const user = await User.findOne(filter, true);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await User.matchPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // ── Subscription status check ──
        const latestSub = await UserSubscription.getLatestForUser(user.id);

        // Kabhi bhi plan purchase complete nahi hua — signup beech mein chhod diya tha
        if (!latestSub || latestSub.status === 'pending' || latestSub.status === 'failed') {
            return res.status(403).json({
                success: false,
                message: 'Please complete your subscription plan purchase to activate your account.',
                needsPlanPurchase: true,
            });
        }

        // Plan kabhi active tha, ab expire ho chuka hai ya check karna hai
        const now = new Date();
        const isExpired = latestSub.status === 'expired' ||
            (latestSub.status === 'active' && new Date(latestSub.endDate) < now);

        if (isExpired && user.isActive) {
            // Safety-net — daily cron abhi tak nahi chala shayad
            await User.findByIdAndUpdate(user.id, { isActive: false });
            user.isActive = false;
        }

        const token = generateToken(user.id);

        return res.status(200).json({
            success: true,
            message: 'Logged in successfully.',
            token,
            user: sanitizeUser(user),
            needsRenewal: isExpired,
            planExpiry: latestSub.endDate,
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// ── Get Me ────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        return res.status(200).json({ success: true, user: sanitizeUser(req.user) });
    } catch (error) {
        console.error('GetMe error:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── Update Profile ────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const { fullName, country, phone, gender, dateOfBirth } = req.body;
        console.log("REQ BODY:", req.body);
        console.log("REQ FILE:", req.file);  // ← image aa rahi hai ya nahi
        console.log("REQ HEADERS:", req.headers['content-type']);

        // Only update avatar if a new file was actually uploaded
        const avatarUrl = req.file ? req.file.path : undefined;

        if (phone) {
            const taken = await User.phoneExistsForOtherUser(phone, req.user.id);
            if (taken) {
                return res.status(409).json({
                    success: false,
                    message: 'This phone number is already in use.',
                });
            }
        }

        const updateData = { fullName, country, phone, gender, dateOfBirth };
        if (avatarUrl) updateData.avatar = avatarUrl; // only overwrite if new file came in

        const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData);

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: sanitizeUser(updatedUser),
        });

    } catch (error) {
        console.error('UpdateProfile error:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};
// ── Change Password ───────────────────────────────────────────────────────
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Both current and new password are required',
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
            });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password',
            });
        }

        // includePassword: true to get hash for comparison
        const user = await User.findById(req.user.id, true);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await User.matchPassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        const hashedPassword = await User.hashPassword(newPassword);
        await User.findByIdAndUpdate(user.id, { password: hashedPassword });

        return res.status(200).json({ success: true, message: 'Password updated successfully' });

    } catch (err) {
        console.error('[PUT /api/user/change-password]', err.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        // ✅ Email se user dhundho — token se nahi
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If this email is registered, a reset link has been sent.',
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

        await User.findByIdAndUpdate(user.id, {
            resetToken,
            resetTokenExpiry,
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,      // smtp.hostinger.com
            port: parseInt(process.env.EMAIL_PORT),  // 465
            secure: true,                      // true for port 465
            auth: {
                user: process.env.EMAIL_USER,    // support@kolkatakart.in
                pass: process.env.EMAIL_PASS,    // Kolkatakart@04
            },
        });

        await transporter.sendMail({
            from: `"Maharashtra Bazaar" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Reset Your Password — Maharashtra Bazaar',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h2 style="color: #16a34a; margin-bottom: 8px;">Maharashtra Bazaar</h2>
                    <p style="color: #374151;">Hi <strong>${user.fullName}</strong>,</p>
                    <p style="color: #374151;">We received a request to reset your password. Click the button below to set a new one:</p>
                    <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 28px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 14px;">
                        Reset Password
                    </a>
                    <p style="color: #6b7280; font-size: 13px;">This link will expire in <strong>30 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="color: #9ca3af; font-size: 12px;">© Maharashtra Bazaar. If the button doesn't work, copy this link: ${resetUrl}</p>
                </div>
            `,
        });

        return res.status(200).json({
            success: true,
            message: 'If this email is registered, a reset link has been sent.',
        });

    } catch (error) {
        console.error('ForgotPassword error:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};
// ── Reset Password ────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        // Find user with this token and check it hasn't expired
        const user = await User.findByResetToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset link. Please request a new one.',
            });
        }

        const hashedPassword = await User.hashPassword(newPassword);

        // Update password and clear the token
        await User.findByIdAndUpdate(user.id, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        });

        return res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });

    } catch (error) {
        console.error('ResetPassword error:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };