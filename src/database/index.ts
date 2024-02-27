import mongoose from 'mongoose';
import Logger from 'bunyan';

import createLogger from 'src/logger';
import { DATABASE_URL } from 'utils/variables';

const log: Logger = createLogger('database');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    await mongoose.connect(DATABASE_URL);
    log.info('db is connected');
  } catch (error) {
    log.error('db connection failed: ', error);
  }
};

export default connectDB;
