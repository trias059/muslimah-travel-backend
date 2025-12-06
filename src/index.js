const express = require('express')
require('dotenv/config')
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const userRoutes = require('./routes/UserRoutes')
const adminRoutes = require('./routes/AdminRoutes')
const packageRoutes = require('./routes/PackageRoutes')
const articleRoutes = require('./routes/ArticleRoutes')
const destinationRoutes = require('./routes/DestinationRoutes')
const locationRoutes = require('./routes/LocationRoutes')
const testimonialRoutes = require('./routes/TestimonialRoutes')
const wishlistRoutes = require('./routes/WishlistRoutes')

const app = express()
const port = process.env.PORT || 3000

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/user', userRoutes)
app.use('/admin', adminRoutes)
app.use('/packages', packageRoutes)
app.use('/articles', articleRoutes)
app.use('/destinations', destinationRoutes)
app.use('/locations', locationRoutes)
app.use('/testimonials', testimonialRoutes)
app.use('/wishlists', wishlistRoutes)

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Muslimah Travel API',
        documentation: '/api-docs',
        version: '1.0.0'
    })
})

app.get('/user', (req, res) => {
    res.json({ status: 'OK' })
})

app.listen(port, () => {
    console.log(`Server running at: http://localhost:${port}`)
})

module.exports = app
