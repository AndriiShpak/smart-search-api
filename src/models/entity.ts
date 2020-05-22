import { IEntity } from '../interfaces/IEntity';
import mongoose from 'mongoose';
import { nameSchema } from './shared/name';

const Entity = new mongoose.Schema(
  {
    name: nameSchema,

    clientId: Number,

    groupReference: String,

    entities: [
      {
        name: nameSchema,
        synonyms: [nameSchema],
      },
    ],

    isReadyForSearch: Boolean,

    isRequired: Boolean,

    isOnlySynonyms: Boolean,
  },
  { timestamps: true },
);

export default mongoose.model<IEntity & mongoose.Document>('Entity', Entity);
