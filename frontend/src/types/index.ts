export interface Team {
  _id: string;
  name: 'Earth' | 'Water' | 'Fire' | 'Air';
  color: string;
  score: number;
  members: User[];
  description: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'pending' | 'ongoing' | 'completed';
  sequence: number;
}

export interface Score {
  _id: string;
  teamId: string;
  eventId: string;
  points: number;
  addedBy: string;
  notes: string;
  createdAt: string;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'junior' | 'admin';
  teamId?: string;
  team?: Team;
}

export interface Leaderboard {
  _id: string;
  name: string;
  color: string;
  score: number;
  members: User[];
}
