import express, { Application } from 'express';
import Logger from 'bunyan';
import 'dotenv/config';

import authRoutes from 'routes/auth';
import createLogger from 'src/logger';
import connectDB from 'src/database';

const app: Application = express();
const log: Logger = createLogger('server');

const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/v1/auth', authRoutes);

connectDB();
app.listen(PORT, () => log.info(`Server is listening on port ${PORT}`));
