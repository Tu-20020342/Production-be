import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  tier: {
    type: Number,
    enum: [1, 2, 3, 4],
  },
  tierName: {
    type: String,
  },
  address: {
    type: String,
  },
});

schema.index({ tierName: 'text' });

export const Division = mongoose.model('Division', schema);
