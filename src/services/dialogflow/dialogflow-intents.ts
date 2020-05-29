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
      // end

      const request = {
        parent: projectAgentPath,
        languageCode: config.supportedLanguages[0],
        intentBatchInline: {
          intents: intents.map(entity => this.generateIntentPayloadWithoutParameters(entity)),
        },
      };

      const resultWithPromise = await intentsClient.batchUpdateIntents(request);

      const result = (await resultWithPromise[0].promise())[0];

      intents.forEach(intent => {
        const intentFromResponse = result.intents.find(
          resultEntity => resultEntity.displayName === this.generateIntentName(intent),
        );

        intent.dialogflowId = intentFromResponse.name;
      });

      return intents;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async update(intent: IIntent): Promise<IIntent> {
    try {
      const intentsClient = new IntentsClient({
        keyFilename: config.dialogflow.keyPath,
      });
      const projectId = config.dialogflow.projectId;
      const projectAgentPath = intentsClient.agentPath(projectId);

      const waitRequests = [];

      config.supportedLanguages.forEach(languageCode => {
        const request = {
          parent: projectAgentPath,
          languageCode: languageCode,
          intent: {
            ...this.generateIntentPayload(intent, languageCode),
            name: intent.dialogflowId,
          },
        };

        waitRequests.push(intentsClient.updateIntent(request));
      });

      await Promise.all(waitRequests);

      return intent;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  private generateIntentPayload(intent: IIntent, languageCode: string): any {
    const trainingPhrases = (intent.trainingPhrases[languageCode] || []).map(trainingPhrase => ({
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
      ...this.generateIntentPayloadWithoutParameters(intent),
      trainingPhrases,
      parameters,
    };
  }

  private generateIntentPayloadWithoutParameters(intent: IIntent): any {
    return {
      displayName: this.generateIntentName(intent),
      trainingPhrases: [],
      parameters: [],
    };
  }

  private generateIntentName(intent: IIntent): string {
    return intent.name.system;
  }
}
