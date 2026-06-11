import { validationResult } from 'express-validator';
import { Project, Task } from '../models/index.js';

export const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { title, description, startDate, dueDate, assignedDevelopers } = req.body;

    const project = await Project.create({
      title,
      description,
      startDate,
      dueDate,
      assignedDevelopers,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('assignedDevelopers', 'name email')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ assignedDevelopers: req.user._id })
        .populate('createdBy', 'name email')
        .populate('assignedDevelopers', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      message: 'Projects fetched successfully',
      data: { projects },
    });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedDevelopers', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'admin') {
      const isAssigned = project.assignedDevelopers.some(
        (dev) => dev._id.toString() === req.user._id
      );
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Project fetched successfully',
      data: { project, tasks },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { title, description, startDate, dueDate, assignedDevelopers, status } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, startDate, dueDate, assignedDevelopers, status },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Task.deleteMany({ project: req.params.id });

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
