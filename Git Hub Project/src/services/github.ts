import { GitHubRepo } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

export async function searchRepositories(
  query: string,
  sort: string = 'stars',
  order: string = 'desc',
  language?: string
) {
  let q = query || 'stars:>1';
  if (language) {
    q += ` language:${language}`;
  }

  const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
    q
  )}&sort=${sort}&order=${order}&per_page=20`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }
  return response.json();
}

export async function getRepoAnalytics(owner: string, repo: string) {
  // Fetching some basic analytics data
  // In a real app, we'd fetch contributors, commit activity, etc.
  // For this demo, we'll fetch weekly commit activity
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/stats/commit_activity`;
  const response = await fetch(url);
  
  if (response.status === 202) {
    // GitHub is calculating stats, return empty or retry logic
    return [];
  }
  
  if (!response.ok) {
    return [];
  }
  
  return response.json();
}
