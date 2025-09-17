const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();  

const app = express();

const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // sender email
        pass: process.env.EMAIL_PASS,  // app password
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

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));



// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/salone', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));


app.get('/home', wrapAsync(async (req, res) => {
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
    res.render('salone/about', {adminData,staffData });
}));
app.get('/price', wrapAsync(async (req, res) => {
    const services = await Services.find();
    const adminData = await Admin.findOne({});
    res.render('salone/price', { services,adminData });
}));
app.get('/service',  wrapAsync(async(req, res) => {
    const services = await Services.find();
    res.render('salone/services', { services });
}));
app.get('/contact', wrapAsync(async (req, res) => {
    res.render('salone/contact');

}));
app.post("/save-contact", wrapAsync(async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Save user/contact info
    const newContact = new User({ name, email, subject, message });
    await newContact.save();
    const admins = await Admin.find(); 
    const adminEmails = admins.map(admin => admin.contactEmail); 
    const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Request Has Been Submitted',
    html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1e90ff;">Hello ${name},</h2>
        <p>Thank you for contacting us! We have received your message and will get back to you shortly.</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>Your message:</p>
        <blockquote style="border-left: 4px solid #1e90ff; padding-left: 10px; color: #555;">${message}</blockquote>
        <p>Best regards,<br><strong>Admin Team</strong></p>
        <hr style="border: none; border-top: 1px solid #eee;">
        <small style="color: #999;">This is an automated email. Please do not reply.</small>
    </div>
    `
};
const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: "hiteshvari5544@gmail.com", // array of admin emails
    subject: 'New Contact Form Submission',
    html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #ff4500;">New Contact Form Submission</h2>
        <p>A new user has submitted the contact form. Details are below:</p>
        <table style="border-collapse: collapse; width: 100%;">
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Name</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">${name}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Email</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">${email}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Subject</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">${subject}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Message</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">${message}</td>
            </tr>
        </table>
        <p style="margin-top: 20px;">Best regards,<br><strong>Your Website Admin</strong></p>
    </div>
    `
};

    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.redirect('/contact');
}));


app.get('/gallery', wrapAsync(async (req, res) => {
    const galleryImages = await GalleryImage.find();
    res.render('salone/gallery', { galleryImages });
}));

app.get('/team', wrapAsync(async (req, res) => {
    const staffData = await Staff.find();
    res.render('salone/team', { staffData });
}));
app.listen(8080, () => {
    console.log('Server running on port 8080');
});
