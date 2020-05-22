import { Service, Inject } from 'typedi';
import { IEntityDTO, IEntity } from '../interfaces/IEntity';
import DialogflowEntitiesService from './dialogflow/dialogflow-entities';

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

  public async batchCreate(entityInputDTO: IEntityDTO[]): Promise<boolean> {
    try {
      const entitiesForCreate = entityInputDTO.map(entity => ({
        clientId: 1,
        groupReference: entity.groupReference,
        name: entity.name,
        entities: entity.entities.map(childEntity => ({
          name: childEntity,
          synonyms: [],
        })),
        isReadyForSearch: false,
        isRequired: false,
        isOnlySynonyms: false,
      }));

      const entityRecords = await this.entityModel.create(entitiesForCreate);

      if (!entityRecords) {
        throw new Error('Entity cannot be created');
      }

      return true;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async update(entity: IEntity): Promise<IEntity> {
    try {
      const updatedEntity = await this.entityModel.findOneAndUpdate({ _id: entity._id }, entity, { new: true });

      if (!updatedEntity) {
        throw new Error('Entity cannot be updated');
      }

      await this.dialogflowEntitiesService.update(entity);

      return updatedEntity;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
