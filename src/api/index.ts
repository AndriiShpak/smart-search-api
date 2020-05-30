import { Router } from 'express';
import auth from './routes/auth';
import user from './routes/user';
import filters from './routes/filters';
import clientdata from './routes/clientdata';
import intents from './routes/intents';
import query from './routes/query';
// import agendash from './routes/agendash';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  auth(app);
  user(app);
  filters(app);
  clientdata(app);
  intents(app);
  query(app);
  // agendash(app);

  return app;
};
