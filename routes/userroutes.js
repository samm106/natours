const express = require('express');
const multer = require('multer');
const usercontroller = require('../controller/usercontroller');
const authcontroller = require('../controller/authcontroller');

const Router = express.Router();

Router.post('/signup', authcontroller.signup);
Router.post('/login', authcontroller.login);
Router.get('/logout', authcontroller.logout);

Router.post('/forgotpassword', authcontroller.forgotPassword);
Router.patch('/resetpassword/:token', authcontroller.resetPassword);

Router.use(authcontroller.protect);

Router.patch('/updatemypassword', authcontroller.updatePassword);
Router.get('/me', usercontroller.getMe, usercontroller.getUser);
Router.patch(
  '/updateme',
  usercontroller.uploadUserPhoto,
  usercontroller.resizeUserPhoto,
  usercontroller.updateMe
);
Router.delete('/deleteme', usercontroller.deleteMe);

Router.use(authcontroller.restrictTo('admin'));

Router.route('/').get(usercontroller.getAllUsers);
Router.route('/:id')
  .get(usercontroller.getUser)
  .patch(usercontroller.updateUser)
  .delete(usercontroller.deleteUser);

module.exports = Router;
