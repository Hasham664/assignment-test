import { User } from '../models/index.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-__v');
    res.json({
      success: true,
      message: 'Users fetched successfully',
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'developer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

export const getDevelopers = async (req, res, next) => {
  try {
    const developers = await User.find({ role: 'developer' }).select('name email');
    res.json({
      success: true,
      message: 'Developers fetched successfully',
      data: { developers },
    });
  } catch (err) {
    next(err);
  }
};
