import { Project, Task, User } from '../models/index.js';
import { sendSuccess } from '../utils/response.js';
import { DEFAULT_STATUS_MAP } from '../utils/constants.js';

const buildStatusMap = (aggregation) => {
  const map = { ...DEFAULT_STATUS_MAP };
  aggregation.forEach((item) => {
    map[item._id] = item.count;
  });
  return map;
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [totalProjects, totalTasks, totalDevelopers, statusAgg, recentTasks] =
      await Promise.all([
        Project.countDocuments(),
        Task.countDocuments(),
        User.countDocuments({ role: 'developer' }),
        Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Task.find()
          .populate('assignedTo', 'name email')
          .populate('project', 'title')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    sendSuccess(res, 'Admin dashboard fetched successfully', {
      totalProjects,
      totalTasks,
      totalDevelopers,
      tasksByStatus: buildStatusMap(statusAgg),
      recentTasks,
    });
  } catch (err) {
    next(err);
  }
};

export const getDevDashboard = async (req, res, next) => {
  try {
    const [tasks, statusAgg, projects] = await Promise.all([
      Task.find({ assignedTo: req.user._id })
        .populate('project', 'title')
        .sort({ createdAt: -1 }),
      Task.aggregate([
        { $match: { assignedTo: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Project.find({ assignedDevelopers: req.user._id }).select('title status'),
    ]);

    sendSuccess(res, 'Developer dashboard fetched successfully', {
      totalTasks: tasks.length,
      tasksByStatus: buildStatusMap(statusAgg),
      tasks,
      projects,
    });
  } catch (err) {
    next(err);
  }
};
