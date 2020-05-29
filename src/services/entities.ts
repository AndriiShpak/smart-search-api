import { Service, Inject } from 'typedi';
import { IEntityDTO, IEntity } from '../interfaces/IEntity';
import DialogflowEntitiesService from './dialogflow/dialogflow-entities';
import config from '../config';

@Service()
export default class EntitiesService {
  constructor(
    @Inject('entityModel') private entityModel: Models.EntityModel,
    @Inject('logger') private logger,
    private dialogflowEntitiesService: DialogflowEntitiesService,
  ) {}

  public async getAll(): Promise<IEntity[]> {
    try {
      const entityRecords = await this.entityModel.find();

      if (!entityRecords) {
        throw new Error('Entity cannot be listed');
      }

      return entityRecords;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async batchUpdate(entityInputDTO: IEntityDTO[]): Promise<boolean> {
    try {
      const entitiesForUpdate = entityInputDTO.map(entity => ({
        dialogflowId: '',
        clientId: 1,
        groupReference: entity.groupReference,
        name: entity.name,
        entities: entity.entities.map(childEntity => ({
          name: childEntity,
          synonyms: config.supportedLanguages.reduce((acc, language) => {
            acc[language] = [];
            return acc;
          }, {}),
        })),
        isReadyForSearch: false,
        isRequired: false,
        isOnlySynonyms: false,
      }));

      const dialogflowResult = await this.dialogflowEntitiesService.batchUpdate(entitiesForUpdate as IEntity[]);

      if (!dialogflowResult) {
        throw new Error('Entities cannot be created in dialogflow');
      }

      const entityRecords = await this.entityModel.create(dialogflowResult);

      if (!entityRecords) {
        throw new Error('Entities cannot be created in db');
      }

      return true;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async update(entity: IEntity): Promise<IEntity> {
    try {
      const dialogflowResult = await this.dialogflowEntitiesService.update(entity);

      if (!dialogflowResult) {
        throw new Error('Entities cannot be updated in dialogflow');
      }

      const updatedEntity = await this.entityModel.findOneAndUpdate({ _id: entity._id }, entity, { new: true });

      if (!updatedEntity) {
        throw new Error('Entity cannot be updated in db');
      }

      return updatedEntity;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
