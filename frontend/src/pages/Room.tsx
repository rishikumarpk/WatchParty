import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { socketService } from '../services/socket';
import { LogOut, Play, MessageSquare, Copy, Check } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import ChatBox from '../components/ChatBox';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const file = location.state?.file as File;
  const [socketConnected, setSocketConnected] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLeaveRoom = () => {
    socketService.disconnect();
    navigate('/dashboard');
  };

  const copyRoomKey = () => {
    navigator.clipboard.writeText(roomId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!file || !roomId) {
      navigate('/dashboard');
      return;
    }

    socketService.connect();
    const socket = socketService.socket;

    if (socket) {
      setSocketConnected(true);
      socket.emit('JOIN_ROOM', { roomId, user });

      socket.on('ROOM_STATE', () => {
        // We removed UserList, so we don't need to track users here anymore
      });

      // System messages for join/left are handled in ChatBox now
    }

    return () => {
      if (socket) {
        socket.emit('LEAVE_ROOM', { roomId });
      }
      setSocketConnected(false);
      socketService.disconnect();
    };
  }, [roomId, file, navigate]);

  if (!file || !roomId || !socketConnected) return null;

  return (
    <div className="flex flex-col h-screen bg-black text-textMain font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full h-20 bg-black/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-6 text-white shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Play size={18} fill="currentColor" />
            </div>
            <span className="hidden sm:inline">WatchTogether</span>
          </Link>
          
          <div className="ml-4 flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 space-x-2">
            <span className="text-textMuted text-sm font-medium">Room Key:</span>
            <span className="text-white font-mono text-sm tracking-widest">{roomId}</span>
            <button onClick={copyRoomKey} className="ml-2 text-textMuted hover:text-white transition-colors" title="Copy Room Key">
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isChatOpen ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <MessageSquare size={18} />
            <span className="hidden md:inline">Chat</span>
          </button>
          <button onClick={handleLeaveRoom} className="flex items-center space-x-2 text-textMuted hover:text-red-400 transition-colors">
            <LogOut size={18} />
            <span className="hidden md:inline">Leave Room</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row pt-20 overflow-hidden">
        {/* Video Player */}
        <div className="flex-1 bg-black relative flex items-center justify-center">
          <VideoPlayer file={file} roomId={roomId} />
        </div>

        {/* Chat Box */}
        <div className={`${isChatOpen ? 'flex' : 'hidden'} flex-col h-[40vh] md:h-full w-full md:w-80 lg:w-96 flex-shrink-0 border-t md:border-t-0 md:border-l border-white/10 bg-surface/50`}>
          <ChatBox roomId={roomId} />
        </div>
      </div>
    </div>
  );
};

export default Room;
