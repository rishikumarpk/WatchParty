const prisma = require('../prisma/client');

// In-memory room state
const roomsState = {};

module.exports = (io) => {
  // Sync loop for drift correction
  setInterval(() => {
    const now = Date.now();
    for (const [roomId, state] of Object.entries(roomsState)) {
      if (state.playing) {
        // Calculate new position based on elapsed time since last update
        const elapsed = (now - state.updatedAt) / 1000;
        state.currentTime = state.baseTime + elapsed;
      }
      
      io.to(roomId).emit('VIDEO_SYNC', {
        playing: state.playing,
        currentTime: state.currentTime,
        serverTimestamp: now
      });
    }
  }, 10000); // Every 10 seconds

  io.on('connection', (socket) => {
    socket.on('JOIN_ROOM', async ({ roomId, user }) => {
      socket.join(roomId);
      
      if (!roomsState[roomId]) {
        roomsState[roomId] = {
          playing: false,
          currentTime: 0,
          baseTime: 0,
          updatedAt: Date.now(),
          users: {}
        };
      }
      
      roomsState[roomId].users[socket.id] = user;
      
      socket.to(roomId).emit('USER_JOINED', user);
      
      // Send current state to newly joined user
      const state = roomsState[roomId];
      let currentPos = state.currentTime;
      if (state.playing) {
        const elapsed = (Date.now() - state.updatedAt) / 1000;
        currentPos = state.baseTime + elapsed;
      }
      
      socket.emit('ROOM_STATE', {
        playing: state.playing,
        currentTime: currentPos,
        serverTimestamp: Date.now(),
        users: Object.values(roomsState[roomId].users)
      });
    });

    socket.on('VIDEO_PLAY', ({ roomId, time, timestamp }) => {
      const state = roomsState[roomId];
      if (state) {
        state.playing = true;
        state.baseTime = time;
        state.currentTime = time;
        state.updatedAt = Date.now(); // We use our server time to sync
        io.to(roomId).emit('VIDEO_PLAY', {
          time,
          serverTimestamp: Date.now()
        });
      }
    });

    socket.on('VIDEO_PAUSE', ({ roomId, time }) => {
      const state = roomsState[roomId];
      if (state) {
        state.playing = false;
        state.currentTime = time;
        state.baseTime = time;
        state.updatedAt = Date.now();
        io.to(roomId).emit('VIDEO_PAUSE', { time });
      }
    });

    socket.on('VIDEO_SEEK', ({ roomId, time }) => {
      const state = roomsState[roomId];
      if (state) {
        state.currentTime = time;
        state.baseTime = time;
        state.updatedAt = Date.now();
        io.to(roomId).emit('VIDEO_SEEK', { time, serverTimestamp: Date.now() });
      }
    });

    socket.on('SEND_MESSAGE', async ({ roomId, message, user }) => {
      const msgData = {
        user_id: user.id,
        room_id: roomId, // Using room.id from DB is better, but here we just pass the db id
        message,
        timestamp: new Date()
      };
      
      // Save to db
      try {
        await prisma.message.create({
          data: msgData
        });
      } catch (err) {
        console.error('Error saving message', err);
      }
      
      io.to(roomId).emit('RECEIVE_MESSAGE', {
        username: user.display_name,
        avatar: user.avatar_id,
        message,
        timestamp: msgData.timestamp
      });
    });

    socket.on('disconnecting', () => {
      for (const roomId of socket.rooms) {
        if (roomsState[roomId] && roomsState[roomId].users[socket.id]) {
          const user = roomsState[roomId].users[socket.id];
          delete roomsState[roomId].users[socket.id];
          io.to(roomId).emit('USER_LEFT', user);
        }
      }
    });
  });
};
