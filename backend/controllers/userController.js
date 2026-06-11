import { User } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validate } from '../utils/validate.js';
import { USER_ROLES } from '../utils/constants.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    sendSuccess(res, 'Users fetched successfully', { users });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { role } = req.body;
    if (!USER_ROLES.includes(role)) {
      return sendError(res, 'Invalid role', 400);
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, 'User role updated successfully', { user });
  } catch (err) {
    next(err);
  }
};

export const getDevelopers = async (req, res, next) => {
  try {
    const developers = await User.find({ role: 'developer' }).select('name email').sort({ name: 1 });
    sendSuccess(res, 'Developers fetched successfully', { developers });
  } catch (err) {
    next(err);
  }
};
