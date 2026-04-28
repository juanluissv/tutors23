import express from 'express';
import path from 'path'
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
//import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import teacherRoutes from './routes/teacherRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import chatRoutes from './routes/chatRoutes.js';
import ttsRoutes from './routes/ttsRoutes.js';
import schoolAdminRoutes from './routes/schoolAdminRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import multer  from 'multer'; 
import {fileURLToPath} from 'url';


dotenv.config()

connectDB()


const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve() //set  __dirname to current directory
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')))


// var upload = multer({ dest: path.dirname(__filename) + '/public/uploads/' });
// var type = upload.single('upl');



app.use('/api/schooladmins', schoolAdminRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/teachers', teacherRoutes);





console.log(process.env.NODE_ENV);


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend/build')))
    app.get('*', (req, res) =>
      res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
    )
} else {
    app.get('/', (req, res) => {
      res.send('API is running....')
    })
}
  

// app.use(notFound)
// app.use(errorHandler)

const PORT = process.env.PORT || 8100


app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`));

export default app;
