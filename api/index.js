require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();
const authRoutes = require('../src/routes/UserRoutes');
const packageRoutes = require('../src/routes/PackageRoutes');
const articleRoutes = require('../src/routes/ArticleRoutes');
const destinationRoutes = require('../src/routes/DestinationRoutes');
const locationRoutes = require('../src/routes/LocationRoutes');
const testimonialRoutes = require('../src/routes/TestimonialRoutes');
const wishlistRoutes = require('../src/routes/WishlistRoutes');

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.json({
        message: 'Muslimah Travel API is running!',
        documentation: '/api-docs'
    });
});

app.use('/user', authRoutes);
app.use('/packages', packageRoutes);
app.use('/articles', articleRoutes);
app.use('/destinations', destinationRoutes);
app.use('/locations', locationRoutes);
app.use('/testimonials', testimonialRoutes);
app.use('/wishlists', wishlistRoutes);

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