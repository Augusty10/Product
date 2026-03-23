import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Post, Category } from '../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories
    const categoriesUnsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

    // Fetch published posts
    let postsQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );

    if (selectedCategory) {
      postsQuery = query(
        collection(db, 'posts'),
        where('status', '==', 'published'),
        where('categoryId', '==', selectedCategory),
        orderBy('publishedAt', 'desc')
      );
    }

    const postsUnsubscribe = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => {
      categoriesUnsubscribe();
      postsUnsubscribe();
    };
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900"
        >
          Insights & Stories from <span className="text-indigo-600">Lumina</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto"
        >
          Discover thought-provoking articles on technology, design, and the future of digital experiences.
        </motion.p>
      </section>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === null ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col"
            >
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 mb-4">
                  <Tag className="w-3 h-3" />
                  {categories.find(c => c.id === post.categoryId)?.name || 'Uncategorized'}
                </div>
                <Link to={`/post/${post.slug}`}>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow">
                  {post.excerpt || 'Read more about this interesting topic...'}
                </p>
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {post.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {post.publishedAt ? format(post.publishedAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                  <Link to={`/post/${post.slug}`} className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-500 text-lg italic">No posts found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
