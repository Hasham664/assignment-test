import { Task, Project } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validate } from '../utils/validate.js';
import { POPULATE_USER, POPULATE_PROJECT } from '../utils/constants.js';

const populateTask = (query) =>
  query.populate('assignedTo', POPULATE_USER).populate('project', POPULATE_PROJECT);

export const createTask = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { title, description, project, assignedTo, priority, dueDate } = req.body;

    if (!(await Project.findById(project))) {
      return sendError(res, 'Project not found', 404);
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

    const populatedTask = await populateTask(Task.findById(task._id));
    sendSuccess(res, 'Task created successfully', { task: populatedTask }, 201);
  } catch (err) {
    next(err);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
    const tasks = await populateTask(Task.find(filter).sort({ createdAt: -1 }));

    sendSuccess(res, 'Tasks fetched successfully', { tasks });
  } catch (err) {
    next(err);
  }
};

export const getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await populateTask(
      Task.find({ project: req.params.projectId }).sort({ createdAt: -1 })
    );

    sendSuccess(res, 'Tasks fetched successfully', { tasks });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 'Task not found', 404);

    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id) {
      return sendError(res, 'Access denied', 403);
    }

    const isAdmin = req.user.role === 'admin';
    const updates = isAdmin
      ? req.body
      : { status: req.body.status };

    const updatedTask = await populateTask(
      Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    );

    sendSuccess(res, 'Task updated successfully', { task: updatedTask });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return sendError(res, 'Task not found', 404);

    sendSuccess(res, 'Task deleted successfully');
  } catch (err) {
    next(err);
  }
};
