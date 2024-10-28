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
