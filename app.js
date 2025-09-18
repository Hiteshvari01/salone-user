const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();  
const flash = require("connect-flash");
const app = express();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const wrapAsync = require('./utils/wrapAsync');

// Import models
const Admin = require("./models/admin");
const Services = require('./models/service');
const Booking = require('./models/booking');
const Customer = require('./models/customer');
const GalleryImage = require("./models/gallery");
const Staff = require('./models/staff');
const User = require("./models/user");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(wrapAsync(async (req, res, next) => {
    const admin = await Admin.findOne({});
    res.locals.admin = admin;
    next();
}));

// EJS Setup
app.use(ejsLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/boilerplate'); 
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));



// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', wrapAsync(async (req, res) => {
    const adminData = await Admin.findOne();
    const services = await Services.find();
    const bookings = await Booking.find();
    const customers = await Customer.find();
    const galleryImages = await GalleryImage.find();
    const staffData = await Staff.find();
    res.render('salone/home', { adminData, services, bookings, customers, galleryImages, staffData });
}));

app.get('/about', wrapAsync(async (req, res) => {
    const adminData = await Admin.findOne();
    const staffData = await Staff.find();
    res.render('salone/about', { adminData, staffData });
}));

app.get('/price', wrapAsync(async (req, res) => {
    const services = await Services.find();
    const adminData = await Admin.findOne();
    res.render('salone/price', { services, adminData });
}));

app.get('/service', wrapAsync(async (req, res) => {
    const services = await Services.find();
    res.render('salone/services', { services });
}));

app.get('/contact', wrapAsync(async (req, res) => {
    const success = req.flash("success"); // ✅ Flash message get karna
    res.render('salone/contact', { success: success[0] }); // Pass first message
}));

app.post("/save-contact", wrapAsync(async (req, res) => {
    const { name, email, subject, message } = req.body;

    const newContact = new User({ name, email, subject, message });
    await newContact.save();

    const admins = await Admin.find();
    const adminEmails = admins.map(admin => admin.contactEmail);

    const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Request Has Been Submitted',
        html: `<div>Thank you, ${name}, for contacting us. We will get back to you soon!</div>`
    };

    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmails.join(','),
        subject: 'New Contact Form Submission',
        html: `<div>New message from ${name} (${email}):<br>${message}</div>`
    };

    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.status(200).json({ message: 'Message sent successfully!' }); // ✅ JSON response for AJAX
}));

app.get('/gallery', wrapAsync(async (req, res) => {
    const galleryImages = await GalleryImage.find();
    res.render('salone/gallery', { galleryImages });
}));

app.get('/team', wrapAsync(async (req, res) => {
    const staffData = await Staff.find();
    res.render('salone/team', { staffData });
}));

// Start server
app.listen(8080, () => {
    console.log('Server running on port 8080');
});
