export interface DashboardResponse {
  stats: {
    members: number;
    exams: number;
    groups: number;
    averageScore: number;
  };

  recentActivity: {
    type: string;
    message: string;
    date: string;
  }[];
}