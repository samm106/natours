const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/usermodel');
const catchAsync = require('../utils/catchAsync');
const Apperror = require('../utils/apperror');
const Email = require('../utils/email');

const signtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signtoken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body)
  //   name: req.body.name,
  //   eMail: req.body.eMail,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  //   // passwordChangedAt: req.body.passwordChangedAt,
  //   role: req.body.role,
  // });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { eMail, password } = req.body;

  if (!eMail || !password) {
    return next(new Apperror('please provide email and password!', 404));
  }

  const user = await User.findOne({ eMail }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new Apperror('incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new Apperror('you are not logged in! please log in to get access', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new Apperror('the user belonging to this token no longer exist', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new Apperror('user recently changed! please log in again', 401)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Apperror('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ eMail: req.body.eMail });
  if (!user) {
    return next(new Apperror('there is no user with this email address'));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
  // await sendEmail({
  //   email: user.eMail,
  //   subject: 'your password reset token (valid for 10 min)',
  //   message,
  // });
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  await new Email(user, resetURL).sendResetPassword();
  res.status(200).json({
    status: 'success',
    message: 'token sent to email!',
  });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new Apperror(
        'there was an error sending the email, try again later.',
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new Apperror('token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new Apperror('your current password is wrong', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
