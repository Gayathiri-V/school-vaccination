import express from 'express';

const router = express.Router();

// POST /api/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check hardcoded coordinator credentials
  if (email === 'admin@school.com' && password === 'admin123') {
    return res.json({ success: true });
  }

  // Invalid credentials
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

export default router;