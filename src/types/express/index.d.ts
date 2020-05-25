import { Document, Model } from 'mongoose';
import { IUser } from '../../interfaces/IUser';
import { IEntity } from '../../interfaces/IEntity';
import { Logger } from 'winston';

declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
    }
  }

  namespace Models {
    export type UserModel = Model<IUser & Document>;
    export type EntityModel = Model<IEntity & Document>;
    export type MyLogger = Logger;
  }
}
