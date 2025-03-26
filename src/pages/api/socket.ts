import { Server as HttpServer } from 'http';
import { Socket } from 'net';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export type NextApiSocketResponse = NextApiResponse & {
  socket: Socket & {
    server: HttpServer & {
      io: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiSocketResponse) {
  if (!res.socket.server.io) {
    const http: HttpServer = res.socket.server;

    // Socket configuration
    const io = new SocketIOServer(http, {
      pingInterval: 2000,
      pingTimeout: 7000,
      cors: {
        origin: true,
        methods: ['GET', 'HEAD', 'POST'],
        credentials: true,
      },
      allowEIO3: true,
    });

    io.on('connection', (socket) => {
      socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        //console.log(`User join room ${roomId}`);
      });

      socket.on('message', (args: any) => {
        socket.in(String(args.roomId)).emit('message_room', args);
        //console.log(`Data: ${JSON.stringify(args, null, 2)}`);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
