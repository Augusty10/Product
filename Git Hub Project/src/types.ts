export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  updated_at: string;
  topics: string[];
}

export interface Bookmark {
  repoId: number;
  repo: GitHubRepo;
  note: string;
  addedAt: string;
}

export type SortOption = 'stars' | 'forks' | 'updated';
export type OrderOption = 'desc' | 'asc';
