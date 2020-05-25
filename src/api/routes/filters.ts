import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import EntitiesService from '../../services/entities';

const route = Router();

export default (app: Router) => {
  app.use('/filters', route);

  route.get('/entities', async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get<Models.MyLogger>('logger');
    logger.debug('Calling entities list endpoint with body: %o', req.body);
    try {
      const entitiesServiceInstance = Container.get(EntitiesService);
      const entities = await entitiesServiceInstance.getAll();
      return res.status(200).json(entities);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.put('/entities', async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get<Models.MyLogger>('logger');
    logger.debug('Calling entities list endpoint with body: %o', req.body);
    try {
      const entitiesServiceInstance = Container.get(EntitiesService);
      const entity = await entitiesServiceInstance.update(req.body);
      return res.status(200).json(entity);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
