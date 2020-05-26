import { Document, Model } from 'mongoose';
import { Logger } from 'winston';
import { IUser } from '../../interfaces/IUser';
import { IEntity } from '../../interfaces/IEntity';
import { IIntent } from '../../interfaces/IIntent';

declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
    }
  }

  namespace Models {
    export type UserModel = Model<IUser & Document>;
    export type EntityModel = Model<IEntity & Document>;
    export type IntentModel = Model<IIntent & Document>;
    export type MyLogger = Logger;
  }
}
