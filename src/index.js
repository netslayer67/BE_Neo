const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const AuthRoutes = require('./routes/AuthRoutes');
const UserRoutes = require('./routes/UserRoutes');
const ProductRoutes = require('./routes/ProductRoutes');
const CartRoutes = require('./routes/CartRoutes');
const OrderRoutes = require('./routes/OrderRoutes');

const app = express();
const PORT = 5000
// const morgan = require('morgan');
const bodyParser = require('body-parser');

// app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//connect database
connectDB()

// Middleware
app.use(express.json());
// Cors
app.use(cors());

// API routes
app.use('/api/auth', AuthRoutes);
app.use('/api/', UserRoutes);
app.use('/api/', ProductRoutes);
app.use('/api/', CartRoutes);
app.use('/api/', OrderRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});