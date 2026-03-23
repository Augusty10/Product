import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Post } from '../types';
import { format } from 'date-fns';
import { Calendar, User, ArrowLeft, Share2, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;

    const q = query(collection(db, 'posts'), where('slug', '==', slug));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPost({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Post);
      } else {
        setPost(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `posts/${slug}`);
    });

    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">Post Not Found</h2>
        <p className="text-slate-600">The article you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <header className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
          <Tag className="w-3 h-3" />
          {post.categoryId || 'Uncategorized'}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center justify-between py-6 border-y border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              {post.authorName[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{post.authorName}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {post.publishedAt ? format(post.publishedAt.toDate(), 'MMMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-indigo-600 prose-strong:text-slate-900 prose-blockquote:border-indigo-600 prose-blockquote:bg-indigo-50/50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg">
        {/* Using dangerouslySetInnerHTML for Quill content, but ReactMarkdown for safety if preferred */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      <footer className="pt-12 border-t border-slate-100">
        <div className="bg-slate-100 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {post.authorName[0]}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-lg font-bold text-slate-900">About {post.authorName}</h3>
            <p className="text-slate-600 text-sm">
              Passionate writer and digital creator sharing insights on the Lumina platform. 
              Exploring the intersection of technology and human experience.
            </p>
          </div>
        </div>
      </footer>
    </motion.article>
  );
}
