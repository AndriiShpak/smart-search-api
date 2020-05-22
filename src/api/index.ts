import { Router } from 'express';
import auth from './routes/auth';
import user from './routes/user';
import filters from './routes/filters';
// import agendash from './routes/agendash';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  auth(app);
  user(app);
  filters(app);
  // agendash(app);

  return app;
};
