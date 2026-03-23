import React from 'react';
import { Star, GitFork, AlertCircle, ExternalLink, Bookmark, BookmarkCheck, Info } from 'lucide-react';
import { GitHubRepo } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface RepoCardProps {
  repo: GitHubRepo;
  isBookmarked: boolean;
  onBookmark: (repo: GitHubRepo) => void;
  onViewDetails: (repo: GitHubRepo) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({
  repo,
  isBookmarked,
  onBookmark,
  onViewDetails,
}) => {
  return (
    <div className="group relative bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-400 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            className="w-10 h-10 rounded-lg border border-zinc-100"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-semibold text-zinc-900 truncate max-w-[200px]">
              {repo.name}
            </h3>
            <p className="text-xs text-zinc-500">@{repo.owner.login}</p>
          </div>
        </div>
        <button
          onClick={() => onBookmark(repo)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isBookmarked 
              ? "bg-amber-50 text-amber-600 border border-amber-200" 
              : "bg-zinc-50 text-zinc-400 hover:text-zinc-600 border border-zinc-100"
          )}
        >
          {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      <p className="text-sm text-zinc-600 line-clamp-2 mb-4 min-h-[40px]">
        {repo.description || "No description provided."}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {repo.language && (
          <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-medium rounded-md uppercase tracking-wider">
            {repo.language}
          </span>
        )}
        {repo.topics?.slice(0, 3).map((topic) => (
          <span key={topic} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-md uppercase tracking-wider">
            #{topic}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4 mt-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-zinc-500 mb-1">
            <Star size={14} />
            <span className="text-xs font-mono">Stars</span>
          </div>
          <span className="text-sm font-semibold">{repo.stargazers_count.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-zinc-500 mb-1">
            <GitFork size={14} />
            <span className="text-xs font-mono">Forks</span>
          </div>
          <span className="text-sm font-semibold">{repo.forks_count.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-zinc-500 mb-1">
            <AlertCircle size={14} />
            <span className="text-xs font-mono">Issues</span>
          </div>
          <span className="text-sm font-semibold">{repo.open_issues_count.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onViewDetails(repo)}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Info size={16} />
          Details
        </button>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <ExternalLink size={18} />
        </a>
      </div>
      
      <div className="mt-2 text-[10px] text-zinc-400 text-center">
        Updated {formatDistanceToNow(new Date(repo.updated_at))} ago
      </div>
    </div>
  );
};
