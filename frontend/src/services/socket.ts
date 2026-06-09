import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

const URL = API_BASE_URL;

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(URL, {
        autoConnect: true,
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
