import { Service, Inject } from 'typedi';
import { IEntity } from '../../interfaces/IEntity';
import config from '../../config';

import { EntityTypesClient } from '@google-cloud/dialogflow';

@Service()
export default class DialogflowEntitiesService {
  constructor(@Inject('logger') private logger) {}

  public async update(entity: IEntity): Promise<IEntity> {
    try {
      // Instantiates clients
      const intentsClient = new EntityTypesClient({
        keyFilename: config.dialogflow.keyPath,
      });
      const projectId = config.dialogflow.projectId;
      const projectAgentPath = intentsClient.agentPath(projectId);
      // const request = {
      //   parent: projectAgentPath,
      //   languageCode: 'en',
      //   entityTypeBatchInline: {
      //     entityTypes: [
      //       {
      //         // TODO: name unique
      //         // name: `projects/${config.dialogflow.projectId}/agent/entityTypes/${entity.name.system}`,
      //         displayName: entity.name.system,
      //         kind: 'KIND_MAP' as 'KIND_MAP',
      //         entities: entity.entities.map(subEntity => ({
      //           value: subEntity.name.system,
      //           synonyms: subEntity.synonyms.map(synonym => synonym.system),
      //         })),
      //       },
      //     ],
      //   },
      // };
      const request = {
        parent: projectAgentPath,
        languageCode: 'en',
        entityType: {
          // TODO: name unique
          // name: `projects/${config.dialogflow.projectId}/agent/entityTypes/${entity.name.system}`,
          displayName: entity.name.system,
          kind: 'KIND_MAP' as 'KIND_MAP',
          entities: entity.entities.map(subEntity => ({
            value: subEntity.name.system,
            synonyms: subEntity.synonyms.map(synonym => synonym.system),
          })),
        },
      };

      const result = await intentsClient.createEntityType(request);

      console.log('@@@@@SUCCESS', result);

      return;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
