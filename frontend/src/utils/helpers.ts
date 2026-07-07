export const getTeamColor = (teamName: string): string => {
  const colors: Record<string, string> = {
    'Earth': '#22c55e',
    'Water': '#3b82f6',
    'Fire': '#ef4444',
    'Air': '#fbbf24',
  };
  return colors[teamName] || '#6b7280';
};

export const getTeamBgClass = (teamName: string): string => {
  const classes: Record<string, string> = {
    'Earth': 'bg-gradient-earth',
    'Water': 'bg-gradient-water',
    'Fire': 'bg-gradient-fire',
    'Air': 'bg-gradient-air',
  };
  return classes[teamName] || 'bg-gray-500';
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const isAdmin = (role: string): boolean => {
  return role === 'admin';
};
