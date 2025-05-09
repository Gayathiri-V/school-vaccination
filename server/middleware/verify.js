import jwt from 'jsonwebtoken';
import User from "../models/User.js";

export const verifyToken = (req, res, next) =>{
    try {
        const token = req.header('Authorization').split(' ').at(-1) 
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided' });
        }
        console.log('verifying token')
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.verifyToken = decoded
        next()
    } catch (err) {
        console.log('Invalid token.', req.headers)
        res.status(400).json({ message: 'Invalid token.' });
    } 
};

export const verifyDev = async (req, res, next) => {
    try {
        const decoded = req.verifyToken
        console.log(decoded)
        const user = await User.findById(decoded._id);
        if (!user || !user.dev) {
            return res.status(403).json({ error: 'Access denied. Devs only.' });
        }
        req.verifyDev = user
        next()
    } catch (err) {
        console.log('cant verify dev', req.headers, req.body)
        res.status(400).json({ error: 'Cant verify dev' });
    }
};



export const checkIfDev = async (req, res, next) => {
    try {
        const decoded = req.verifyToken
        const user = await User.findById(decoded._id);
        req.checkIfDev = false
        if (user.dev) {
            req.checkIfDev = true
        }
        next()
    } catch (err) {
        console.log('cant check dev', req.headers, req.body)
        console.log('here')
        res.status(400).json({ error: 'cant check dev' });
    }
};

