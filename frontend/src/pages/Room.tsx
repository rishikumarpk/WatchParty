import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { LogOut, Home } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import ChatBox from '../components/ChatBox';
import UserList from '../components/UserList';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const file = location.state?.file as File;
  const [users, setUsers] = useState<any[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    socketService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleHome = () => {
    navigate('/dashboard');
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

      socket.on('ROOM_STATE', (state: any) => {
        if (state.users) {
          setUsers(state.users.filter((u: any) => u.id !== user.id));
        }
      });

      socket.on('USER_JOINED', (newUser: any) => {
        setUsers((prev) => {
          if (prev.find(u => u.id === newUser.id)) return prev;
          return [...prev, newUser];
        });
      });

      socket.on('USER_LEFT', (leftUser: any) => {
        setUsers((prev) => prev.filter(u => u.id !== leftUser.id));
      });
    }

    return () => {
      if (socket) {
        socket.emit('LEAVE_ROOM', { roomId });
        socket.off('ROOM_STATE');
        socket.off('USER_JOINED');
        socket.off('USER_LEFT');
      }
      setSocketConnected(false);
      socketService.disconnect();
    };
  }, [roomId, file, navigate]);

  if (!file || !roomId || !socketConnected) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      {/* Main Content Area: 80% on Desktop */}
      <div className="flex-1 flex flex-col h-[60vh] md:h-screen bg-black">
        <div className="flex items-center justify-between bg-surface/50 border-b border-white/10 pr-4">
          <div className="flex-1 overflow-hidden">
            <UserList users={[{...user, isMe: true}, ...users]} />
          </div>
          <div className="flex items-center space-x-3 ml-2 flex-shrink-0">
            <button onClick={handleHome} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-textMain bg-white/5 hover:bg-white/10 hover:text-primary transition-colors rounded-xl border border-white/10">
              <Home size={18} /> <span className="hidden sm:inline">Home</span>
            </button>
            <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-textMain bg-white/5 hover:bg-white/10 hover:text-red-400 transition-colors rounded-xl border border-white/10">
              <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <VideoPlayer file={file} roomId={roomId} />
        </div>
      </div>

      {/* Chat Box: 20% on Desktop */}
      <div className="h-[40vh] md:h-screen w-full md:w-80 lg:w-96 flex-shrink-0">
        <ChatBox roomId={roomId} />
      </div>
    </div>
  );
};

export default Room;
