import { Service, Inject } from 'typedi';
import config from '../../config';

import { AgentsClient } from '@google-cloud/dialogflow';

@Service()
export default class DialogflowAgentService {
  constructor(@Inject('logger') private logger) {}

  public async train(): Promise<void> {
    try {
      // TODO: abstract client creation from function
      const agentClient = new AgentsClient({
        keyFilename: config.dialogflow.keyPath,
      });
      const projectId = config.dialogflow.projectId;
      const projectAgentPath = agentClient.projectPath(projectId);
      // end

      const request = {
        parent: projectAgentPath,
      };

      await agentClient.trainAgent(request);

      return;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
