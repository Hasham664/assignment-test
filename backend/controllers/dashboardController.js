import { Project, Task, User } from '../models/index.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [totalProjects, totalTasks, totalDevelopers, tasksByStatus, recentTasks] =
      await Promise.all([
        Project.countDocuments(),
        Task.countDocuments(),
        User.countDocuments({ role: 'developer' }),
        Task.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Task.find()
          .populate('assignedTo', 'name email')
          .populate('project', 'title')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    const statusMap = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    tasksByStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    res.json({
      success: true,
      message: 'Admin dashboard fetched successfully',
      data: {
        totalProjects,
        totalTasks,
        totalDevelopers,
        tasksByStatus: statusMap,
        recentTasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getDevDashboard = async (req, res, next) => {
  try {
    const [myTasks, tasksByStatus, myProjects] = await Promise.all([
      Task.find({ assignedTo: req.user._id })
        .populate('project', 'title')
        .sort({ createdAt: -1 }),
      Task.aggregate([
        { $match: { assignedTo: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Project.find({ assignedDevelopers: req.user._id }).select('title status'),
    ]);

    const statusMap = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    tasksByStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    res.json({
      success: true,
      message: 'Developer dashboard fetched successfully',
      data: {
        totalTasks: myTasks.length,
        tasksByStatus: statusMap,
        tasks: myTasks,
        projects: myProjects,
      },
    });
  } catch (err) {
    next(err);
  }
};
