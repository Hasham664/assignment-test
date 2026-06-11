import { validationResult } from 'express-validator';
import { Task, Project } from '../models/index.js';

export const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { title, description, project, assignedTo, priority, dueDate } = req.body;

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask },
    });
  } catch (err) {
    next(err);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    let tasks;

    if (req.user.role === 'admin') {
      tasks = await Task.find()
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      message: 'Tasks fetched successfully',
      data: { tasks },
    });
  } catch (err) {
    next(err);
  }
};

export const getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Tasks fetched successfully',
      data: { tasks },
    });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role !== 'admin') {
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'name email')
        .populate('project', 'title');

      return res.json({
        success: true,
        message: 'Task status updated successfully',
        data: { task: updatedTask },
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, assignedTo, dueDate },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('project', 'title');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
