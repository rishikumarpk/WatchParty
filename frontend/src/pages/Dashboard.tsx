import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { generateVideoHash } from '../utils/hash';
import { Upload, Plus, LogIn, LogOut, Play, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AvatarPicker from '../components/AvatarPicker';

const Dashboard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [editDisplayName, setEditDisplayName] = useState(user.display_name || '');
  const [editAvatarId, setEditAvatarId] = useState(user.avatar_id || 'avatar_1');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/update', { display_name: editDisplayName, avatar_id: editAvatarId });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsSettingsOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    }
  };

  const handleCreateRoom = async () => {
    if (!file) return setError('Please select a video file first');
    setIsProcessing(true);
    setError('');
    
    try {
      const hash = await generateVideoHash(file);
      const { data } = await api.post('/rooms/create', { video_hash: hash });
      navigate(`/room/${data.room_code}`, { state: { file } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create room');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!file) return setError('Please select a video file first');
    if (!roomCode) return setError('Please enter a room code');
    setIsProcessing(true);
    setError('');

    try {
      const hash = await generateVideoHash(file);
      const { data } = await api.get(`/rooms/${roomCode}`);
      
      if (data.room.video_hash !== hash) {
        throw new Error('Video files do not match. Please select the correct video.');
      }
      
      navigate(`/room/${roomCode}`, { state: { file } });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to join room');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-textMain font-sans relative flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 w-full h-20 bg-black/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-center text-white">
        <div className="w-full max-w-[1200px] px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Play size={18} fill="currentColor" />
              </div>
              WatchTogether
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSettingsOpen(true)} className="flex items-center space-x-2 text-textMuted hover:text-white transition-colors">
              <Settings size={20} />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-textMuted hover:text-red-400 transition-colors">
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 w-full max-w-4xl mx-auto p-4 pt-32">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary bg-surface/50">
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatar_id}`} alt="avatar" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome, {user.display_name}</h1>
              <p className="text-textMuted text-sm">Ready for a watch party?</p>
            </div>
          </div>
        </header>

        {error && <div className="p-4 mb-8 text-red-200 bg-red-900/50 border border-red-500/50 rounded-xl">{error}</div>}

        <div className="grid md:grid-cols-2 gap-8">
          {/* File Selection */}
          <div className="p-8 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
              <Upload size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Select Video File</h2>
            <p className="text-textMuted mb-6 text-sm">Choose the local video file you want to watch. The file stays on your computer.</p>
            
            <label className="cursor-pointer group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover">
              <input 
                type="file" 
                accept="video/*" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <span>{file ? file.name : 'Browse Files'}</span>
            </label>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface/50 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="text-primary" /> Create New Room
              </h3>
              <button 
                onClick={handleCreateRoom}
                disabled={isProcessing}
                className="w-full py-3 font-semibold text-primary transition-all bg-primary/10 border border-primary/30 rounded-xl hover:bg-primary/20 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Create Room'}
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-surface/50 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <LogIn className="text-primary" /> Join Existing Room
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Room Code (e.g. ABC123)"
                  className="flex-1 px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-textMain"
                />
                <button 
                  onClick={handleJoinRoom}
                  disabled={isProcessing || !roomCode}
                  className="px-6 py-3 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover disabled:opacity-50"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface/90 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 text-textMuted hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Avatar</label>
                <AvatarPicker selectedAvatar={editAvatarId} onSelect={setEditAvatarId} />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-textMain"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 mt-4 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
