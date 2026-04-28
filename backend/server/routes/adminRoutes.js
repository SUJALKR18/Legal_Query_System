const express = require('express');
const User = require('../models/User');
const ChatSession = require('../models/ChatSession');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is admin
const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@legalquery.com';

        if (!user || user.email !== adminEmail) {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Server error during admin verification.' });
    }
};

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// GET /api/admin/users/:userId/sessions - Get all sessions for a specific user
router.get('/users/:userId/sessions', async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.params.userId }).sort({ updatedAt: -1 });
        const user = await User.findById(req.params.userId).select('name email');
        res.json({ sessions, user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user sessions.' });
    }
});

// GET /api/admin/sessions/:sessionId - Get details of any session
router.get('/sessions/:sessionId', async (req, res) => {
    try {
        const session = await ChatSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found.' });

        const user = await User.findById(session.userId).select('name email');
        res.json({ session, user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch session details.' });
    }
});

// GET /api/admin/stats - Get overall system stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSessions = await ChatSession.countDocuments();
        const activeSessions = await ChatSession.countDocuments({ isSolved: false });

        res.json({
            stats: {
                totalUsers,
                totalSessions,
                activeSessions,
                resolvedSessions: totalSessions - activeSessions
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats.' });
    }
});

module.exports = router;
