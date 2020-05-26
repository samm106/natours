const express = require('express');
const bookingcontroller = require('../controller/bookingcontroller');
const authcontroller = require('../controller/authcontroller');

const router = express.Router({ mergeParams: true });

router.use(authcontroller.protect);

router.get(
  '/checkout-session/:tourId',
  authcontroller.protect,
  bookingcontroller.getCheckoutSession
);

router.use(authcontroller.restrictTo('admin', 'lead-guide'));
router.route('/').get(bookingcontroller.getAllBookings);
router.route('/').post(bookingcontroller.createBooking);
router
  .route('/:id')
  .get(bookingcontroller.getBooking)
  .patch(bookingcontroller.updateBooking)
  .delete(bookingcontroller.deleteBooking);

module.exports = router;
