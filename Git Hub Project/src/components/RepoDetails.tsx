import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { GitHubRepo } from '../types';
import { getRepoAnalytics } from '../services/github';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';

interface RepoDetailsProps {
  repo: GitHubRepo;
  onClose: () => void;
  note: string;
  onSaveNote: (note: string) => void;
}

export const RepoDetails: React.FC<RepoDetailsProps> = ({
  repo,
  onClose,
  note,
  onSaveNote,
}) => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [localNote, setLocalNote] = useState(note);

  useEffect(() => {
    setLoading(true);
    getRepoAnalytics(repo.owner.login, repo.name).then((data) => {
      // Transform data for recharts
      const chartData = Array.isArray(data) ? data.map((week: any, index: number) => ({
        week: `W${index + 1}`,
        commits: week.total || 0,
      })) : [];
      setAnalytics(chartData);
      setLoading(false);
    });
    setLocalNote(note);
  }, [repo, note]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col"
      >
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 flex justify-between items-start bg-zinc-50">
            <div className="flex gap-4">
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="w-16 h-16 rounded-xl border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">{repo.name}</h2>
                <a
                  href={repo.owner.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-900 transition-colors text-sm"
                >
                  @{repo.owner.login}
                </a>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Stars</p>
                <p className="text-xl font-bold">{repo.stargazers_count.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Forks</p>
                <p className="text-xl font-bold">{repo.forks_count.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Issues</p>
                <p className="text-xl font-bold">{repo.open_issues_count.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Language</p>
                <p className="text-xl font-bold truncate">{repo.language || 'N/A'}</p>
              </div>
            </div>

            {/* Analytics Chart */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <TrendingUp size={18} />
                <h3>Commit Activity (Last 52 Weeks)</h3>
              </div>
              <div className="h-[250px] w-full bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
                  </div>
                ) : analytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics}>
                      <defs>
                        <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                      <XAxis 
                        dataKey="week" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#71717a' }}
                        interval={4}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#71717a' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="commits" 
                        stroke="#18181b" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorCommits)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-400 text-sm italic">
                    No activity data available or still calculating...
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <MessageSquare size={18} />
                <h3>Personal Notes</h3>
              </div>
              <textarea
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
                placeholder="Add your thoughts or research notes about this project..."
                className="w-full h-32 p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none text-sm"
              />
              <button
                onClick={() => onSaveNote(localNote)}
                className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-100 flex justify-end gap-3">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              <ExternalLink size={16} />
              View on GitHub
            </a>
          </div>
        </motion.div>
      </div>
    );
  };
