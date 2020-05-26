import { IName } from './shared/IName';

export interface ITrainingPhrasePart {
  text: string;
  entityType: string;
}

export interface ITrainingPhrase {
  dialogflowId: string;
  parts: ITrainingPhrasePart[];
}

export interface IIntent {
  _id: string;
  clientId: number;
  dialogflowId: string;
  name: IName;
  trainingPhrases: IName<ITrainingPhrase[]>;
}

export interface IIntentDTO {
  name: IName;
}
