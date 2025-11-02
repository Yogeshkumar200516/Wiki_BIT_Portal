const express = require('express');
const { config, db } = require('./src/config/config.js');
const adminRoutes = require('./src/routes/adminRoutes');
const authRoutes = require('./src/routes/authRoutes');
const facultyRoutes = require('./src/routes/facultyRoutes.js');

const app = express();
const cors = require("cors");
app.use(express.json()); // 👈 Required for JSON request bodies
app.use(express.urlencoded({ extended: true })); // 👈 Handles URL-encoded data

app.use(
    cors({
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  
app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);

// Verify DB Connection Before Starting Server
db.query('SELECT 1') // Simple query to check connection
  .then(() => {
    console.log('✅ Database connection verified.');
  
    // Start the server
    app.listen(config.server.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.server.port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1); // Exit process if DB is not connected
  });

// Basic Route to Test API
app.get('/', (req, res) => {
  res.send('✅ Server & Database are running successfully!');
});
