import { Service, Inject } from 'typedi';
import DialogflowQueryService from './dialogflow/dialogflow-query';
import { IQueryIdentifyResponse } from '../interfaces/IQuery';

@Service()
export default class QueryService {
  constructor(@Inject('logger') private logger, private dialogflowQueryService: DialogflowQueryService) {}

  public async identify(query: string, language: string): Promise<IQueryIdentifyResponse> {
    try {
      return await this.dialogflowQueryService.indentify(query, language);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
