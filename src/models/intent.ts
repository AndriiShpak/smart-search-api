import { IIntent } from '../interfaces/IIntent';
import mongoose from 'mongoose';
import { nameSchema } from './shared/name';

const Intent = new mongoose.Schema(
  {
    name: nameSchema,

    dialogflowId: String,

    clientId: Number,

    trainingPhrases: {
      type: Map,
      of: [
        {
          dialogflowId: String,
          parts: [
            {
              text: String,
              entityType: String,
            },
          ],
        },
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model<IIntent & mongoose.Document>('Intent', Intent);
