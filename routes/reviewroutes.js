const express = require('express');
const reviewcontroller = require('../controller/reviewcontroller');
const authcontroller = require('../controller/authcontroller');

const router = express.Router({ mergeParams: true });

router.use(authcontroller.protect);

router
  .route('/')
  .get(reviewcontroller.getAllReview)
  .post(
    authcontroller.restrictTo('user'),
    reviewcontroller.setTourUserIds,
    reviewcontroller.createReview
  );

router
  .route('/:id')
  .get(reviewcontroller.getReview)
  .delete(
    authcontroller.restrictTo('user', 'admin'),
    reviewcontroller.deleteReview
  )
  .patch(
    authcontroller.restrictTo('user', 'admin'),
    reviewcontroller.updateReview
  );

module.exports = router;
