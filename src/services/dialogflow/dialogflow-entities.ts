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
      // end

      const request = {
        parent: projectAgentPath,
        languageCode: config.supportedLanguages[0],
        entityTypeBatchInline: {
          entityTypes: entities.map(entity => this.generateEntityTypeWithoutEntities(entity)),
        },
      };

      let resultWithPromise = await entityTypesClient.batchUpdateEntityTypes(request);

      const result = (await resultWithPromise[0].promise())[0];

      entities.forEach(entity => {
        const entityTypeFromResponse = result.entityTypes.find(
          resultEntity => resultEntity.displayName === this.generateEntityName(entity),
        );

        entity.dialogflowId = entityTypeFromResponse.name;
      });

      await Promise.all(entities.map(entity => this.update(entity)));

      return entities;
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

      const waitRequests = [];

      config.supportedLanguages.forEach(languageCode => {
        const request = {
          parent: projectAgentPath,
          languageCode: languageCode,
          updateMask: {
            paths: ['entities'],
          },
          entityType: {
            ...this.generateEntityType(entity, languageCode),
            name: entity.dialogflowId,
          },
        };

        waitRequests.push(entityTypesClient.updateEntityType(request));
      });

      await Promise.all(waitRequests);

      return entity;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  private generateEntityType(entity: IEntity, language: string): any {
    return {
      ...this.generateEntityTypeWithoutEntities(entity),
      entities: entity.entities.map(subEntity => ({
        value: subEntity.name[language],
        synonyms: subEntity.synonyms[language],
      })),
    };
  }

  private generateEntityTypeWithoutEntities(entity: IEntity) {
    return {
      displayName: this.generateEntityName(entity),
      kind: 'KIND_MAP' as 'KIND_MAP',
      enableFuzzyExtraction: true,
      entities: [],
    };
  }

  private generateEntityName(entity: IEntity): string {
    return `${entity.groupReference}___${entity.name.system}`;
  }
}
