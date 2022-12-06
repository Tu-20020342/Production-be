import mongoose, { Schema } from 'mongoose';

const schema = new mongoose.Schema({
  manufactureDate: {
    type: String,
  },
  batchSeri: {
    type: String,
  },
  warrantyPeriod: {
    type: Number,
  },
  note: {
    type: String,
  },
  divisionId: {
    type: Schema.Types.ObjectId,
  },
});

schema.index({ note: 'text' });

export const Batch = mongoose.model('Batch', schema);
