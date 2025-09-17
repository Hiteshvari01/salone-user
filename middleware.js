const { adminSchema, blogPostSchema, bookingSchema, customerSchema, galleryImageSchema, imageSchema, serviceSchema, reviewSchema, staffSchema } = require("./Schema.js");
const Admin = require("./models/admin");
const Booking = require("./models/booking");
const Customer = require("./models/customer");
const GalleryImage = require("./models/gallery");
const Image = require("./models/image");
const Service = require("./models/service");
const Staff = require("./models/staff");
const ExpressError = require("./utils/ExpressError");

// ---------- Validation Middlewares ----------
module.exports.validateAdmin = (req, res, next) => {
 const { error } = adminSchema.validate(req.body, { allowUnknown: true });
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

module.exports.validateBlogPost = (req, res, next) => {
  const { error } = BlogPost.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.validateBooking = (req, res, next) => {
    const { error } = Booking.validate(req.body, { abortEarly: false });
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

module.exports.validateCustomer = (req, res, next) => {
  const { error } = Customer.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.validateGalleryImage = (req, res, next) => {
  const { error } = GalleryImage.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.validateImage = (req, res, next) => {
  const { error } = Image.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.validateService = (req, res, next) => {
  const { error } = Service.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = review.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.validateStaff = (req, res, next) => {
    const { error } = Staff.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};


// ---------- Authentication & Authorization ----------
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// ---------- Ownership Check Examples ----------
module.exports.isAdminOwner = async (req, res, next) => {
  const { id } = req.params;
  const admin = await Admin.findById(id);
  if (!admin.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this admin record");
    return res.redirect(`/admins/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId, id } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/services/${id}`);
  }
  next();
};
