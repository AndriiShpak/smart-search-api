import { Service, Inject } from 'typedi';
import config from '../../config';
import { SessionsClient } from '@google-cloud/dialogflow';
import { IQueryIdentifyResponse } from '../../interfaces/IQuery';

@Service()
export default class DialogflowQueryService {
  constructor(@Inject('logger') private logger) {}

  // TODO: add return type
  public async indentify(query: string, language: string): Promise<IQueryIdentifyResponse> {
    try {
      // TODO: abstract client creation from function
      const sessionClient = new SessionsClient({ keyFilename: config.dialogflow.keyPath });
      const projectId = config.dialogflow.projectId;
      const sessionPath = sessionClient.projectAgentSessionPath(projectId, '112312312');
      // end

      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: query,
            languageCode: language,
          },
        },
      };

      const responses = await sessionClient.detectIntent(request);
      const queryResult = responses[0].queryResult;

      return {
        queryText: queryResult.queryText,
        intentDialogflowId: queryResult.intent.name,
        allRequiredParamsPresent: queryResult.allRequiredParamsPresent,
        parameters: Object.keys(queryResult.parameters.fields)
          .map(parameterName => {
            const splitted = parameterName.split('___');
            let parameter = parameterName;
            if (splitted.length === 2) {
              parameter = splitted[1];
            }

            return [parameterName, parameter];
          })
          .reduce((acc, [parameterNameOriginal, parameterName]) => {
            acc[parameterName] =
              queryResult.parameters.fields[parameterNameOriginal].listValue?.values.map(value => value.stringValue) ||
              [];
            return acc;
          }, {}),
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
