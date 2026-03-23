import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  addDoc 
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Message, Room, OnlineUser, UserProfile } from './types';
import { 
  Send, 
  Hash, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  MessageSquare, 
  Users,
  Circle,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<string>('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        // Sync user to Firestore
        setDoc(doc(db, 'users', u.uid), {
          uid: u.uid,
          displayName: u.displayName || 'Anonymous',
          photoURL: u.photoURL || '',
          lastSeen: new Date().toISOString(),
          isOnline: true
        }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  // Socket.IO setup
  useEffect(() => {
    if (user) {
      const newSocket = io();
      setSocket(newSocket);

      newSocket.emit('join', {
        userId: user.uid,
        displayName: user.displayName || 'Anonymous'
      });

      newSocket.on('user_status', (users: OnlineUser[]) => {
        setOnlineUsers(users);
      });

      newSocket.on('new_message', (msg: Message) => {
        if (msg.roomId === activeRoom) {
          setMessages(prev => [...prev, msg]);
        }
      });

      newSocket.on('user_typing', (data: { roomId: string; userId: string; displayName: string; isTyping: boolean }) => {
        if (data.roomId === activeRoom) {
          setTypingUsers(prev => {
            const next = { ...prev };
            if (data.isTyping) {
              next[data.userId] = data.displayName;
            } else {
              delete next[data.userId];
            }
            return next;
          });
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, activeRoom]);

  // Fetch rooms
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const roomsData = snapshot.docs.map(doc => doc.data() as Room);
      if (roomsData.length === 0) {
        // Create default room if none exist
        const defaultRoom = { id: 'general', name: 'General', description: 'Public chat for everyone' };
        setDoc(doc(db, 'rooms', 'general'), defaultRoom);
      }
      setRooms(roomsData);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch messages
  useEffect(() => {
    if (!user || !activeRoom) return;
    
    // Join socket room
    socket?.emit('join_room', activeRoom);

    const q = query(
      collection(db, activeRoom.startsWith('private_') ? `private_chats/${activeRoom}/messages` : `rooms/${activeRoom}/messages`),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data() as Message);
      setMessages(msgs);
    });

    return () => {
      unsubscribe();
      socket?.emit('leave_room', activeRoom);
    };
  }, [user, activeRoom, socket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    socket?.disconnect();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !activeRoom) return;

    const messageData: Message = {
      id: Date.now().toString(),
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      text: inputText,
      roomId: activeRoom,
      createdAt: new Date().toISOString()
    };

    try {
      // Save to Firestore for persistence
      const path = activeRoom.startsWith('private_') 
        ? `private_chats/${activeRoom}/messages` 
        : `rooms/${activeRoom}/messages`;
      await addDoc(collection(db, path), messageData);
      
      // Emit via socket for real-time
      socket?.emit('send_message', messageData);
      
      setInputText('');
      socket?.emit('typing', { roomId: activeRoom, userId: user.uid, displayName: user.displayName, isTyping: false });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (user && activeRoom) {
      socket?.emit('typing', { 
        roomId: activeRoom, 
        userId: user.uid, 
        displayName: user.displayName, 
        isTyping: e.target.value.length > 0 
      });
    }
  };

  const startPrivateChat = (otherUser: OnlineUser) => {
    if (!user) return;
    const chatId = [user.uid, otherUser.userId].sort().join('_');
    setActiveRoom(`private_${chatId}`);
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || !user) return;
    const roomId = newRoomName.toLowerCase().replace(/\s+/g, '-');
    await setDoc(doc(db, 'rooms', roomId), {
      id: roomId,
      name: newRoomName,
      createdBy: user.uid
    });
    setNewRoomName('');
    setShowNewRoomModal(false);
    setActiveRoom(roomId);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 text-center"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
              <MessageSquare className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Nexus Chat</h1>
            <p className="mt-2 text-zinc-400">Connect instantly with anyone, anywhere.</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 group"
          >
            <Circle className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-72 border-r border-zinc-800 flex flex-col bg-zinc-900/50 backdrop-blur-xl"
          >
            <div className="p-6 border-bottom border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-500" />
                <span className="font-bold text-xl tracking-tight">Nexus</span>
              </div>
              <button 
                onClick={() => setShowNewRoomModal(true)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              {/* Rooms */}
              <div>
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Channels</span>
                </div>
                <div className="space-y-1">
                  {rooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoom(room.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group",
                        activeRoom === room.id ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-zinc-800 text-zinc-400"
                      )}
                    >
                      <Hash className="w-4 h-4" />
                      <span className="font-medium">{room.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Online Users */}
              <div>
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Direct Messages</span>
                </div>
                <div className="space-y-1">
                  {onlineUsers.filter(u => u.userId !== user.uid).map(u => (
                    <button
                      key={u.socketId}
                      onClick={() => startPrivateChat(u)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group",
                        activeRoom.includes(u.userId) ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-zinc-800 text-zinc-400"
                      )}
                    >
                      <div className="relative">
                        <UserIcon className="w-4 h-4" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-zinc-900" />
                      </div>
                      <span className="font-medium">{u.displayName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold truncate max-w-[120px]">{user.displayName}</span>
                    <span className="text-[10px] text-zinc-500">Online</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors lg:hidden"
            >
              <Users className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-zinc-500" />
              <h2 className="font-bold text-lg">
                {activeRoom.startsWith('private_') 
                  ? onlineUsers.find(u => activeRoom.includes(u.userId))?.displayName || 'Private Chat'
                  : rooms.find(r => r.id === activeRoom)?.name || 'General'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="bg-zinc-900 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-emerald-500 w-64 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((msg, i) => {
            const isMe = msg.senderId === user.uid;
            const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={cn(
                  "flex gap-4",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden",
                  !showAvatar && "opacity-0"
                )}>
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className={cn(
                  "flex flex-col max-w-[70%]",
                  isMe ? "items-end" : "items-start"
                )}>
                  {showAvatar && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-zinc-400">{msg.senderName}</span>
                      <span className="text-[10px] text-zinc-600">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    isMe 
                      ? "bg-emerald-500 text-zinc-950 font-medium rounded-tr-none shadow-lg shadow-emerald-500/10" 
                      : "bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800"
                  )}>
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        <div className="px-6 h-6">
          <AnimatePresence>
            {Object.keys(typingUsers).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-zinc-500 italic flex items-center gap-2"
              >
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-zinc-500 rounded-full" />
                </div>
                {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-6 pt-2">
          <form onSubmit={sendMessage} className="relative">
            <input
              type="text"
              value={inputText}
              onChange={handleTyping}
              placeholder={`Message #${activeRoom.startsWith('private_') ? 'Private Chat' : activeRoom}`}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm placeholder:text-zinc-600"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-zinc-950 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>

      {/* New Room Modal */}
      <AnimatePresence>
        {showNewRoomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewRoomModal(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-2">Create Channel</h3>
              <p className="text-zinc-400 text-sm mb-6">Channels are where your team communicates. They’re best when organized around a topic.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Channel Name</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g. design-team"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowNewRoomModal(false)}
                    className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createRoom}
                    disabled={!newRoomName.trim()}
                    className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
