const variants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-purple-100 text-purple-800',
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    todo: { label: 'To Do', variant: 'default' },
    'in-progress': { label: 'In Progress', variant: 'primary' },
    review: { label: 'Review', variant: 'warning' },
    done: { label: 'Done', variant: 'success' },
    active: { label: 'Active', variant: 'success' },
    completed: { label: 'Completed', variant: 'primary' },
    'on-hold': { label: 'On Hold', variant: 'warning' },
  };

  const config = statusConfig[status] || { label: status, variant: 'default' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    low: { label: 'Low', variant: 'info' },
    medium: { label: 'Medium', variant: 'warning' },
    high: { label: 'High', variant: 'danger' },
  };

  const config = priorityConfig[priority] || { label: priority, variant: 'default' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
