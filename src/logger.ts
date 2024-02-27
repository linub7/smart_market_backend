import bunyan from 'bunyan';

const createLogger = (name: string): bunyan => {
  return bunyan.createLogger({ name, level: 'debug' });
};

export default createLogger;
