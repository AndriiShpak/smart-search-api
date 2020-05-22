import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import EntitiesService from '../../services/entities';
import { IEntityDTO } from '../../interfaces/IEntity';

const mock: IEntityDTO[] = [
  {
    name: {
      system: 'brands',
      uk: 'Бренди',
    },
    groupReference: 'tents',
    entities: [
      {
        system: 'trimm',
        uk: 'Trimm',
      },
      {
        system: 'terra',
        uk: 'Terra Incognita',
      },
    ],
  },
  {
    name: {
      system: 'colors',
      uk: 'Кольори',
    },
    groupReference: 'tents',
    entities: [
      {
        system: 'black',
        uk: 'Чорний',
      },
      {
        system: 'yellow',
        uk: 'Жовтий',
      },
    ],
  },
  {
    name: {
      system: 'colors',
      uk: 'Кольори',
    },
    groupReference: 'sleep-bag',
    entities: [
      {
        system: 'black',
        uk: 'Чорний',
      },
      {
        system: 'yellow',
        uk: 'Жовтий',
      },
      {
        system: 'red',
        uk: 'Червоний',
      },
    ],
  },
  {
    name: {
      system: 'season',
      uk: 'Сезон',
    },
    groupReference: 'sleep-bag',
    entities: [
      {
        system: 'three-seasons',
        uk: 'Три сезони',
      },
      {
        system: 'summer',
        uk: 'Літній',
      },
      {
        system: 'winter',
        uk: 'Зимовий',
      },
    ],
  },
];

const route = Router();

export default (app: Router) => {
  app.use('/filters', route);

  route.get('/entities', async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get('logger');
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
    const logger = Container.get('logger');
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

  // TODO: just temporary to fill test data
  route.get('/createBatch', async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get('logger');
    logger.debug('Calling entities list endpoint with body: %o', req.body);
    try {
      const entitiesServiceInstance = Container.get(EntitiesService);
      await entitiesServiceInstance.batchCreate(mock);
      return res.status(201).json();
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
