const express = require('express');
const viewcontroller = require('../controller/viewcontroller');
const authcontroller = require('../controller/authcontroller');
const bookingcontroller = require('../controller/bookingcontroller');

const router = express.Router();

router.get(
  '/',
  bookingcontroller.createBookingCheckout,
  authcontroller.isLoggedIn,
  viewcontroller.getOverview
);
router.get('/tour/:slug', authcontroller.isLoggedIn, viewcontroller.getTour);
router.get('/login', authcontroller.isLoggedIn, viewcontroller.getLoginForm);
router.get('/me', authcontroller.protect, viewcontroller.getAccount);
router.get('/my-tours', authcontroller.protect, viewcontroller.getMyTours);

// router.post(
//     '/submit-user-data',
//     authcontroller.protect,
//     viewcontroller.updateUserData
//   );

module.exports = router;
