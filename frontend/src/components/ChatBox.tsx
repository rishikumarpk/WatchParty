import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { socketService } from '../services/socket';

interface Message {
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
}

interface ChatBoxProps {
  roomId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const socket = socketService.socket;
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('RECEIVE_MESSAGE', handleReceiveMessage);

    return () => {
      socket.off('RECEIVE_MESSAGE', handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketService.socket) return;

    socketService.socket.emit('SEND_MESSAGE', {
      roomId,
      message: newMessage,
      user
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-surface/80 border-l border-white/10 backdrop-blur-md">
      <div className="p-4 border-b border-white/10 bg-black/20">
        <h3 className="font-semibold text-textMain">Room Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.username === user.display_name ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-primary/20 overflow-hidden border border-primary/50">
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.avatar}`} alt="avatar" />
            </div>
            <div className={`flex flex-col max-w-[75%] ${msg.username === user.display_name ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-textMuted mb-1">{msg.username}</span>
              <div className={`px-4 py-2 rounded-2xl ${
                msg.username === user.display_name 
                  ? 'bg-primary text-white rounded-tr-sm' 
                  : 'bg-white/10 text-textMain rounded-tl-sm'
              }`}>
                {msg.message}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 bg-primary text-white rounded-xl hover:bg-primaryHover disabled:opacity-50 transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
