import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { hashKey } from '../services/encryption';

interface PasswordGateProps {
  onUnlock: (password: string) => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(!localStorage.getItem('cryptnote_hash'));
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSettingUp) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      const hash = hashKey(password);
      localStorage.setItem('cryptnote_hash', hash);
      onUnlock(password);
    } else {
      const storedHash = localStorage.getItem('cryptnote_hash');
      if (hashKey(password) === storedHash) {
        onUnlock(password);
      } else {
        setError('Incorrect password');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
            {isSettingUp ? <ShieldCheck className="text-emerald-400 w-8 h-8" /> : <Lock className="text-emerald-400 w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isSettingUp ? 'Secure Your Notes' : 'Welcome Back'}
          </h1>
          <p className="text-zinc-400 text-center text-sm">
            {isSettingUp 
              ? 'Set a master password to encrypt your notes locally. This password never leaves your device.' 
              : 'Enter your master password to decrypt and access your notes.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
              Master Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="••••••••"
                autoFocus
              />
            </div>
          </div>

          {isSettingUp && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 rounded-xl transition-colors mt-4"
          >
            {isSettingUp ? 'Initialize Vault' : 'Unlock Vault'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-600">
          CryptNote uses AES-256 encryption. Your password is never stored in plain text.
        </p>
      </motion.div>
    </div>
  );
};
