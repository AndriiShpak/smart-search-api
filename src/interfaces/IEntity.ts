import { IName } from './shared/IName';

export interface IEntity {
  _id: string;
  clientId: number;
  dialogflowId: string;
  groupReference: string;
  name: IName;
  entities: Array<{
    name: IName;
    synonyms: IName<string[]>;
  }>;
  isReadyForSearch: boolean;
  isRequired: boolean;
  isOnlySynonyms: boolean;
}

export interface IEntityDTO {
  name: IName;
  groupReference: string;
  entities: IName[];
}
