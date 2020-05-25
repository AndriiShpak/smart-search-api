import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import EntitiesService from '../../services/entities';
import { IEntityDTO } from '../../interfaces/IEntity';

const route = Router();

export default (app: Router) => {
  app.use('/clientdata', route);

  route.post('/entities', async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get<Models.MyLogger>('logger');
    logger.debug('Calling client data populate endpoint with body: %o', req.body);
    try {
      const entitiesServiceInstance = Container.get(EntitiesService);
      await entitiesServiceInstance.batchUpdate(req.body as IEntityDTO[]);
      return res.status(201).json();
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
