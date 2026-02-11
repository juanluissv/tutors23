import express from 'express';
import path from 'path'
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
//import connectDB from './config/db.js';
//import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// import products from './data/products.js';
// import productRoutes from './routes/productRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';
// import uploadRoutes from './routes/uploadRoutes.js';
// import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config()

//connectDB()


const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const __dirname = path.resolve() //set  __dirname to current directory
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')))


app.get('/', (req, res) => {
    res.send("API is running...")
})

app.use('/api/chat', chatRoutes);



// app.use('/api/products', productRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/upload', uploadRoutes);






// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, 'frontend/build')))
//     app.get('*', (req, res) =>
//       res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
//     )
// } else {
//     app.get('/', (req, res) => {
//       res.send('API is running....')
//     })
// }
  

// app.use(notFound)
// app.use(errorHandler)

const PORT = process.env.PORT || 8100


app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`));

export default app;
