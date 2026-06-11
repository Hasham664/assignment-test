import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validate } from '../utils/validate.js';

// const isProduction = process.env.NODE_ENV === 'production';

// const COOKIE_OPTIONS = {
//   httpOnly: true,
//   secure: isProduction,
//   sameSite: isProduction ? 'none' : 'lax',
//   maxAge: 7 * 24 * 60 * 60 * 1000,
//   path: '/',
// };
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};
const generateToken = (user) =>
  jwt.sign({ _id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const setTokenCookie = (res, token) => {
  res.cookie('token', token, COOKIE_OPTIONS);
};

export const register = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'Email already registered', 400);

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user);

    setTokenCookie(res, token);
    sendSuccess(res, 'Registration successful', { user: sanitizeUser(user) }, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user);

    setTokenCookie(res, token);
    sendSuccess(res, 'Login successful', { user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, 'User fetched successfully', { user });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
    path: '/',
  });
  sendSuccess(res, 'Logged out successfully');
};
