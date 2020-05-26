import { Service, Inject } from 'typedi';
import { IIntent } from '../../interfaces/IIntent';
import config from '../../config';

import { IntentsClient } from '@google-cloud/dialogflow';

@Service()
export default class DialogflowIntentsService {
  constructor(@Inject('logger') private logger) {}

  public async batchUpdate(intents: IIntent[]): Promise<IIntent[]> {
    try {
      // TODO: abstract client creation from function
      const intentsClient = new IntentsClient({
        keyFilename: config.dialogflow.keyPath,
      });
      const projectId = config.dialogflow.projectId;
      const projectAgentPath = intentsClient.agentPath(projectId);

      const baseRequest = {
        parent: projectAgentPath,
        languageCode: 'en',
      };

      // TODO: do call for each language
      const request = {
        ...baseRequest,
        intentBatchInline: {
          intents: intents.map(entity => this.generateIntentPayload(entity)),
        },
      };

      await intentsClient.batchUpdateIntents(request);

      const result = await intentsClient.listIntents(baseRequest);

      request.intentBatchInline.intents.forEach((intent, index) => {
        const resultIntent = result[0].find(resultIntent => resultIntent.displayName === intent.displayName);
        intents[index].dialogflowId = resultIntent.name;
      });

      return intents;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async update(intent: IIntent): Promise<IIntent> {
    try {
      const entityTypesClient = new IntentsClient({
        keyFilename: config.dialogflow.keyPath,
      });
      const projectId = config.dialogflow.projectId;
      const projectAgentPath = entityTypesClient.agentPath(projectId);

      const request = {
        parent: projectAgentPath,
        languageCode: 'en',
        intent: {
          ...this.generateIntentPayload(intent),
          name: intent.dialogflowId,
        },
      };

      await entityTypesClient.updateIntent(request);

      return intent;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  private generateIntentPayload(intent: IIntent): any {
    const trainingPhrases = (intent.trainingPhrases.en || []).map(trainingPhrase => ({
      type: 'EXAMPLE' as 'EXAMPLE',
      parts: trainingPhrase.parts.map(trainingPhrasePart => ({
        text: trainingPhrasePart.text,
        entityType: trainingPhrasePart.entityType ? `@${intent.name.system}_${trainingPhrasePart.entityType}` : '',
        userDefined: true,
        alias: trainingPhrasePart.entityType ? `${intent.name.system}_${trainingPhrasePart.entityType}` : '',
      })),
    }));

    const parametersWithDuplicates = trainingPhrases.reduce((acc, item) => {
      return [
        ...acc,
        ...item.parts.reduce((acc2, item2) => {
          return item2.entityType ? [...acc2, item2.entityType] : acc2;
        }, []),
      ];
    }, []);
    const parametersUnique = [...new Set(parametersWithDuplicates)];
    const parameters = parametersUnique.map(param => ({
      displayName: param.replace('@', ''),
      entityTypeDisplayName: param,
      value: param.replace('@', '$'),
      isList: true,
    }));

    return {
      displayName: intent.name.system,
      trainingPhrases,
      parameters,
    };
  }
}
