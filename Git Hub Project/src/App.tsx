import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Github, Bookmark as BookmarkIcon, TrendingUp, LayoutGrid, List, ChevronDown, RefreshCw } from 'lucide-react';
import { GitHubRepo, Bookmark, SortOption, OrderOption } from './types';
import { searchRepositories } from './services/github';
import { RepoCard } from './components/RepoCard';
import { RepoDetails } from './components/RepoDetails';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'Ruby'];

export default function App() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState<SortOption>('stars');
  const [order, setOrder] = useState<OrderOption>('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('github-explorer-bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'explore' | 'bookmarks'>('explore');

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchRepositories(query, sort, order, language);
      setRepos(data.items || []);
    } catch (err) {
      setError('Failed to fetch repositories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, sort, order, language]);

  useEffect(() => {
    handleSearch();
  }, [sort, order, language]);

  useEffect(() => {
    localStorage.setItem('github-explorer-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (repo: GitHubRepo) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.repoId === repo.id);
      if (exists) {
        return prev.filter((b) => b.repoId !== repo.id);
      }
      return [
        ...prev,
        {
          repoId: repo.id,
          repo,
          note: '',
          addedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const updateNote = (repoId: number, note: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.repoId === repoId ? { ...b, note } : b))
    );
  };

  const isBookmarked = (repoId: number) => bookmarks.some((b) => b.repoId === repoId);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 p-2 rounded-lg">
              <Github className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">GitHub Explorer</h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Open Source Analytics</p>
            </div>
          </div>

          <div className="flex items-center bg-zinc-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('explore')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                activeTab === 'explore' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'bookmarks' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <BookmarkIcon size={14} />
              Bookmarks
              {bookmarks.length > 0 && (
                <span className="bg-zinc-900 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {bookmarks.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'explore' ? (
          <div className="space-y-8">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search repositories (e.g. 'react', 'machine learning')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                  Search
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-500">Filters:</span>
                </div>
                
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                >
                  <option value="">All Languages</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                >
                  <option value="stars">Sort by Stars</option>
                  <option value="forks">Sort by Forks</option>
                  <option value="updated">Sort by Updated</option>
                </select>

                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value as OrderOption)}
                  className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>

                <div className="ml-auto flex items-center bg-zinc-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow-sm" : "text-zinc-400")}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white shadow-sm" : "text-zinc-400")}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[350px] bg-white border border-zinc-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {repos.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    isBookmarked={isBookmarked(repo.id)}
                    onBookmark={toggleBookmark}
                    onViewDetails={setSelectedRepo}
                  />
                ))}
                {repos.length === 0 && !loading && (
                  <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-300">
                    <Github className="mx-auto text-zinc-300 mb-4" size={48} />
                    <h3 className="text-zinc-900 font-semibold">No repositories found</h3>
                    <p className="text-zinc-500 text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Your Bookmarks</h2>
                <p className="text-zinc-500 text-sm">Saved repositories and your personal notes</p>
              </div>
            </div>

            {bookmarks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-300">
                <BookmarkIcon className="mx-auto text-zinc-300 mb-4" size={48} />
                <h3 className="text-zinc-900 font-semibold">No bookmarks yet</h3>
                <p className="text-zinc-500 text-sm">Start exploring and save projects you're interested in</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="mt-6 bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  Explore Repositories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.repoId} className="space-y-4">
                    <RepoCard
                      repo={bookmark.repo}
                      isBookmarked={true}
                      onBookmark={toggleBookmark}
                      onViewDetails={setSelectedRepo}
                    />
                    {bookmark.note && (
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-amber-600 mb-1">Your Note</p>
                        <p className="text-xs text-amber-900 italic line-clamp-3">{bookmark.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedRepo && (
          <RepoDetails
            repo={selectedRepo}
            onClose={() => setSelectedRepo(null)}
            note={bookmarks.find(b => b.repoId === selectedRepo?.id)?.note || ''}
            onSaveNote={(note) => {
              if (selectedRepo) {
                updateNote(selectedRepo.id, note);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-200 py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Github size={20} />
            <span className="text-sm font-semibold">GitHub Explorer</span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Built with React, Recharts, and GitHub REST API
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Documentation</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
