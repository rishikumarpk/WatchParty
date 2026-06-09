import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { generateVideoHash } from '../utils/hash';
import { Upload, Plus, LogIn, LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatar_id}`} alt="avatar" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-textMain">Welcome, {user.display_name}</h1>
              <p className="text-textMuted text-sm">Ready for a watch party?</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-textMuted hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
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
    </div>
  );
};

export default Dashboard;
