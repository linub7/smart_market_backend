import express, { Application } from 'express';
import Logger from 'bunyan';
import morgan from 'morgan';
import 'dotenv/config';

import authRoutes from 'routes/auth';
import profileRoutes from 'routes/profile';
import productsRoutes from 'routes/product';
import createLogger from 'src/logger';
import connectDB from 'src/database';
import { NODE_ENV } from 'utils/variables';

const app: Application = express();
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

app.use(function (err, _req, res, _next) {
  res.status(500).json({ status: 'fail', message: err?.message });
} as express.ErrorRequestHandler);

connectDB();
app.listen(PORT, () => log.info(`Server is listening on port ${PORT}`));
