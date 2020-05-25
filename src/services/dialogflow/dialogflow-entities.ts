import { Service, Inject } from 'typedi';
import { IEntity } from '../../interfaces/IEntity';
import config from '../../config';

import { EntityTypesClient } from '@google-cloud/dialogflow';

@Service()
export default class DialogflowEntitiesService {
  constructor(@Inject('logger') private logger) {}

  public async batchUpdate(entities: IEntity[]): Promise<IEntity[]> {
    try {
      // TODO: abstract client creation from function
      const entityTypesClient = new EntityTypesClient({
        keyFilename: config.dialogflow.keyPath,
      });
      const projectId = config.dialogflow.projectId;
      const projectAgentPath = entityTypesClient.agentPath(projectId);

      const baseRequest = {
        parent: projectAgentPath,
        languageCode: 'en',
      };

      // TODO: do call for each language
      const request = {
        ...baseRequest,
        entityTypeBatchInline: {
          entityTypes: entities.map(entity => this.generateEntityType(entity)),
        },
      };

      await entityTypesClient.batchUpdateEntityTypes(request);

      const result = await entityTypesClient.listEntityTypes(baseRequest);

      return entities.map((value, index) => ({
        ...value,
        dialogflowId: result[0][index].name,
      }));
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async update(entity: IEntity): Promise<IEntity> {
    try {
      const entityTypesClient = new EntityTypesClient({
        keyFilename: config.dialogflow.keyPath,
      });
      const projectId = config.dialogflow.projectId;
      const projectAgentPath = entityTypesClient.agentPath(projectId);

      const request = {
        parent: projectAgentPath,
        languageCode: 'en',
        updateMask: {
          paths: ['entities'],
        },
        entityType: {
          ...this.generateEntityType(entity),
          name: entity.dialogflowId,
        },
      };

      await entityTypesClient.updateEntityType(request);

      return entity;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  private generateEntityType(entity: IEntity): any {
    return {
      displayName: `${entity.groupReference}_${entity.name.system}`,
      kind: 'KIND_MAP' as 'KIND_MAP',
      enableFuzzyExtraction: true,
      entities: entity.entities.map(subEntity => ({
        value: subEntity.name.en,
        synonyms: subEntity.synonyms.map(synonym => synonym.en),
      })),
    };
  }
}
