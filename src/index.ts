import express, { Application } from 'express';
import Logger from 'bunyan';
import morgan from 'morgan';
import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { TokenExpiredError, verify } from 'jsonwebtoken';

import authRoutes from 'routes/auth';
import profileRoutes from 'routes/profile';
import productsRoutes from 'routes/product';
import conversationsRoutes from 'routes/conversation';
import createLogger from 'src/logger';
import connectDB from 'src/database';
import { JWT_TOKEN, NODE_ENV } from 'utils/variables';

const app: Application = express();
const server = http.createServer(app);

const io = new Server(server, {
  path: '/socket-message',
});

const log: Logger = createLogger('server');

const PORT = 5000;
if (NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

app.use(express.static('src/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/conversations', conversationsRoutes);

// SOCKET
io.use((socket, next) => {
  const socketReq = socket.handshake?.auth as { token: string } | undefined;

  if (!socketReq?.token) return next(new Error('Unauthorized request'));

  try {
    const decode = verify(socketReq?.token, JWT_TOKEN);
    socket.data.jwtDecode = decode;
  } catch (error) {
    if (error instanceof TokenExpiredError)
      return next(new Error('jwt expired'));

    return next(new Error('invalid token'));
  }

  next();
});
io.on('connection', (socket) => {
  console.log(socket.data);
  console.log(`user is connected: ${socket.id}`);
});

app.use(function (err, _req, res, _next) {
  res.status(500).json({ status: 'fail', message: err?.message });
} as express.ErrorRequestHandler);

connectDB();
server.listen(PORT, () => log.info(`Server is listening on port ${PORT}`));
