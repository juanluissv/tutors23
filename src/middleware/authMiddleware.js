import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'
import Student from '../models/studentModel.js'
import SchoolAdmin from '../models/schoolAdminModel.js'
import Teacher from '../models/teacherModel.js'

// Student must be authenticated
const protectStudent = asyncHandler(async (req, res, next) => {
    let token;
  
    // Read JWT from the 'jwt' cookie
    token = req.cookies.jwt;
  
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        req.student = await Student.findById(decoded.userId).select('-password');

        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    } else {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
});



// School Admin must be authenticated
const protectSchoolAdmin = asyncHandler(async (req, res, next) => {
    let token;
  
    // Read JWT from the 'jwt' cookie
    token = req.cookies.jwt;
  
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        req.schoolAdmin = await SchoolAdmin.findById(decoded.userId).select('-password');

        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    } else {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
});

// Teacher must be authenticated
const protectTeacher = asyncHandler(async (req, res, next) => {
    let token;
  
    // Read JWT from the 'jwt' cookie
    token = req.cookies.jwt;
  
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.teacher = await Teacher.findById(decoded.userId).select('-password');

        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    } else {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
});

export { protectStudent, protectSchoolAdmin, protectTeacher };