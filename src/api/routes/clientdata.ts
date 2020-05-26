import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import EntitiesService from '../../services/entities';
import { IEntityDTO } from '../../interfaces/IEntity';
import IntentsService from '../../services/intents';
import { IIntentDTO } from '../../interfaces/IIntent';

const route = Router();

export default (app: Router) => {
  app.use('/clientdata', route);

  route.post('/entities', async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get<Models.MyLogger>('logger');
    logger.debug('Calling client data populate entities endpoint with body: %o', req.body);
    try {
      const entitiesServiceInstance = Container.get(EntitiesService);
      await entitiesServiceInstance.batchUpdate(req.body as IEntityDTO[]);
      return res.status(201).json();
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.post('/intents', async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get<Models.MyLogger>('logger');
    logger.debug('Calling client data populate intents endpoint with body: %o', req.body);
    try {
      const intentsServiceInstance = Container.get(IntentsService);
      await intentsServiceInstance.batchUpdate(req.body as IIntentDTO[]);
      return res.status(201).json();
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
