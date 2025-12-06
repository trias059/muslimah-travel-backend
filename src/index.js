require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const app = express();

const userRoutes = require('../src/routes/UserRoutes');          
const adminRoutes = require('../src/routes/AdminRoutes');        
const packageRoutes = require('../src/routes/PackageRoutes');
const articleRoutes = require('../src/routes/ArticleRoutes');
const destinationRoutes = require('../src/routes/DestinationRoutes');
const locationRoutes = require('../src/routes/LocationRoutes');
const testimonialRoutes = require('../src/routes/TestimonialRoutes');
const wishlistRoutes = require('../src/routes/WishlistRoutes');
const bookingRoutes = require('../src/routes/BookingRoutes');
const reviewRoutes = require('../src/routes/ReviewRoutes');

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.json({
        message: 'Muslimah Travel API is running!',
        documentation: '/api-docs'
    });
});

app.use('/user', userRoutes);         
app.use('/admin', adminRoutes);        
app.use('/packages', packageRoutes);
app.use('/articles', articleRoutes);
app.use('/destinations', destinationRoutes);
app.use('/locations', locationRoutes);
app.use('/testimonials', testimonialRoutes);
app.use('/wishlists', wishlistRoutes);
app.use('/bookings', bookingRoutes);
app.use('/reviews', reviewRoutes);

app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
    const messageError = err.message || 'internal server error';
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: messageError
    });
});

module.exports = app;