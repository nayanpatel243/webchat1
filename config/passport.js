const passport = require('passport');

module.exports = {
  initialize() {
    return passport.initialize();
  },
  authenticate(req, res, next) {
    return passport.authenticate('jwt', {
      session: false,
    }, (err, user, info) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorised',
        });
      }
      // Forward user information to the next middleware
      req.user = user;
      next();
    })(req, res, next);
  },
};
