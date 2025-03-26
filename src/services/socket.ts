'use client';

import { io, Socket } from 'socket.io-client';

class SocketService {
  socket: Socket;

  constructor(transports: string[] = ['websocket', 'polling'], credentials: boolean = true) {
    this.socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
      transports: transports,
      withCredentials: credentials,
    });

    this.socket.on('connect', () => {
      console.log('Connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected');
    });
  }

  connect() {
    this.socket.connect();
  }

  // Sent an events
  emit(event: string, args: any) {
    this.socket.emit(event, args);
  }

  // Join a room
  join(roomId: string) {
    this.socket.emit('join_room', roomId);
  }

  // Listening to events
  on(event: string, args: any) {
    this.socket.on(event, args);
  }

  off(event: string, args: any) {
    this.socket.off(event, args);
  }
}

export default SocketService;
