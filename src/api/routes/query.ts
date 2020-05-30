import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import QueryService from '../../services/query';

const route = Router();

export default (app: Router) => {
  app.use('/query', route);

  route.get('/identify', async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get<Models.MyLogger>('logger');
    logger.debug('Calling indentify query endpoint with body: %o', req.query);
    try {
      const queryServiceInstance = Container.get(QueryService);
      const indentifyResponse = await queryServiceInstance.identify(
        req.query.query as string,
        req.query.language as string,
      );
      return res.status(200).json(indentifyResponse);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
