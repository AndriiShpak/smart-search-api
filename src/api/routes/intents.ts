import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import IntentsService from '../../services/intents';

const route = Router();

export default (app: Router) => {
  app.use('/intents', route);

  route.get('/datadriven', async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get<Models.MyLogger>('logger');
    logger.debug('Calling intents list endpoint with body: %o', req.body);
    try {
      const intentsServiceInstance = Container.get(IntentsService);
      const intents = await intentsServiceInstance.getAll();
      return res.status(200).json(intents);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.put('/datadriven', async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get<Models.MyLogger>('logger');
    logger.debug('Calling intents update endpoint with body: %o', req.body);
    try {
      const intentsServiceInstance = Container.get(IntentsService);
      const intent = await intentsServiceInstance.update(req.body);
      return res.status(200).json(intent);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
