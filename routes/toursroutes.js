const express = require('express');
const tourcontroller = require('../controller/tourcontroller');
const authcontroller = require('../controller/authcontroller');
const reviewrouter = require('./reviewroutes');

const Router = express.Router();

Router.use('/:tourId/reviews', reviewrouter);

Router.route('/top-5-cheap').get(
  tourcontroller.aliastoptours,
  tourcontroller.getAllTours
);

Router.route('/tour-stats').get(tourcontroller.getTourStats);
Router.route('/monthly-plan/:year').get(
  authcontroller.protect,
  authcontroller.restrictTo('admin', 'lead-guide', 'guide'),
  tourcontroller.getMonthlyPlan
);

Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourcontroller.getToursWithin
);

Router.route('/distance/:latlng/unit/:unit').get(tourcontroller.getDistance);
Router.route('/')
  .get(tourcontroller.getAllTours)
  .post(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontroller.createTour
  );
Router.route('/:id')
  .get(tourcontroller.getTour)
  .patch(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontroller.uploadTourImages,
    tourcontroller.resizeTourImages,
    tourcontroller.updateTour
  )
  .delete(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontroller.deleteTour
  );

// Router.route('/:tourId/reviews').post(
//   authcontroller.protect,
//   authcontroller.restrictTo('user'),
//   reviewcontroller.createReview
// );

module.exports = Router;
