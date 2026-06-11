import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validate } from '../utils/validate.js';

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

export const register = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'Email already registered', 400);

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user);

    sendSuccess(res, 'Registration successful', { user: sanitizeUser(user), token }, 201);
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
    sendSuccess(res, 'Login successful', { user: sanitizeUser(user), token });
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
