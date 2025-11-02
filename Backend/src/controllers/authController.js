const AuthModel = require('../models/authModel.js');

const AuthController = {
    login: async (req, res) => {
        try {
            const { email, user_id, role } = req.body;

            // Fetch user from database
            const user = await AuthModel.getUserByEmail(email);

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Check user_id and role match
            if (user.user_id !== user_id || user.role !== role) {
                return res.status(403).json({ message: 'Invalid credentials' });
            }

            // Successful login response
            res.status(200).json({ message: 'Login successful', user });
        } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = AuthController;
