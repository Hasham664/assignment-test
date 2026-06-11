import { Project, Task } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validate } from '../utils/validate.js';
import { POPULATE_USER } from '../utils/constants.js';

const populateProject = (query) =>
  query.populate('createdBy', POPULATE_USER).populate('assignedDevelopers', POPULATE_USER);

export const createProject = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { title, description, startDate, dueDate, assignedDevelopers } = req.body;

    const project = await Project.create({
      title,
      description,
      startDate,
      dueDate,
      assignedDevelopers,
      createdBy: req.user._id,
    });

    sendSuccess(res, 'Project created successfully', { project }, 201);
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { assignedDevelopers: req.user._id };
    const projects = await populateProject(Project.find(filter).sort({ createdAt: -1 }));

    sendSuccess(res, 'Projects fetched successfully', { projects });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await populateProject(Project.findById(req.params.id));
    if (!project) return sendError(res, 'Project not found', 404);

    if (req.user.role !== 'admin') {
      const isAssigned = project.assignedDevelopers.some(
        (dev) => dev._id.toString() === req.user._id
      );
      if (!isAssigned) return sendError(res, 'Access denied', 403);
    }

    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', POPULATE_USER)
      .sort({ createdAt: -1 });

    sendSuccess(res, 'Project fetched successfully', { project, tasks });
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

    if (!project) return sendError(res, 'Project not found', 404);

    sendSuccess(res, 'Project updated successfully', { project });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return sendError(res, 'Project not found', 404);

    await Task.deleteMany({ project: req.params.id });

    sendSuccess(res, 'Project deleted successfully');
  } catch (err) {
    next(err);
  }
};
