import { Service, Inject } from 'typedi';
import DialogflowIntentsService from './dialogflow/dialogflow-intents';
import { IIntent, IIntentDTO } from '../interfaces/IIntent';
import config from '../config';

@Service()
export default class IntentsService {
  constructor(
    @Inject('intentsModel') private intentsModel: Models.IntentModel,
    @Inject('logger') private logger,
    private dialogflowIntentsService: DialogflowIntentsService,
  ) {}

  public async getAll(): Promise<IIntent[]> {
    try {
      const intentRecords = await this.intentsModel.find();

      if (!intentRecords) {
        throw new Error('Entity cannot be listed');
      }

      return intentRecords;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async batchUpdate(intentInputDTO: IIntentDTO[]): Promise<boolean> {
    try {
      const intentsForUpdate = intentInputDTO.map(intent => ({
        clientId: 1,
        name: intent.name,
        trainingPhrases: config.supportedLanguages.reduce((acc, language) => {
          acc[language] = [];
          return acc;
        }, {}),
      }));

      const dialogflowResult = await this.dialogflowIntentsService.batchUpdate(intentsForUpdate as IIntent[]);

      if (!dialogflowResult) {
        throw new Error('Intents cannot be created in dialogflow');
      }

      const intentRecords = await this.intentsModel.create(dialogflowResult);

      if (!intentRecords) {
        throw new Error('Intents cannot be created in db');
      }

      return true;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async update(intent: IIntent): Promise<IIntent> {
    try {
      const dialogflowResult = await this.dialogflowIntentsService.update(intent);

      if (!dialogflowResult) {
        throw new Error('Intents cannot be updated in dialogflow');
      }

      const updatedEntity = await this.intentsModel.findOneAndUpdate({ _id: intent._id }, intent, { new: true });

      if (!updatedEntity) {
        throw new Error('Intents cannot be updated in db');
      }

      return updatedEntity;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
