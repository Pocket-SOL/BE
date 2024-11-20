const express = require('express');
const router = express.Router();
const { User } = require('../models');

// 사용자 목록 조회
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
