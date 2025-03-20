const userModel = require('../models/userModel');

exports.getProfile = (req, res) => {
  const userId = req.session.userId;

  userModel.findUserById(userId, (err, results) => {
    if (err || results.length === 0) {
      return res.redirect('/login');
    }

    const user = results[0];

    res.render('profile', { user });
  });
};

exports.updateProfile = (req, res) => {
  const userId = req.session.userId;
  const { name, email, phone, role, gender, location } = req.body;

  userModel.updateUserById(userId, { name, email, phone, role, gender, location }, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Profile update failed' });
    }
    res.json({ success: true, message: 'Profile updated successfully' });
  });
};