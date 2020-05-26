const Apperror = require('../utils/apperror');
const catchAsync = require('../utils/catchAsync');
const APIfeatures = require('../utils/apifeatures');




exports.getAll = Model => catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const features = new APIfeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const doc = await features.query;

  res.status(200).json({
    status: 'success',
    requeastreadAt: req.requestTime,
    results: doc.length,
    data: {
      data: doc,
    },
  });
});


exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
  let query =  Model.findById(req.params.id)
  if (popOptions) query = query.populate('reviews')
  const doc  = await query
  if (!doc) {
    return next(new Apperror('no document found with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    requeasredAt: req.requestTime,
    data: {
      data: doc
    },
  });

})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
         doc,
      },
    });
  });

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
  
    if (!doc) {
      return next(new Apperror('no document found with this id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });



  exports.updateOne = Model =>  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  
    if (!doc) {
      return next(new Apperror('no document found with this id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
