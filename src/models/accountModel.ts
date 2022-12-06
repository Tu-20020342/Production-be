import mongoose, { Schema } from 'mongoose';

const schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
  },
  divisionId: {
    type: Schema.Types.ObjectId,
  },
});

schema.index({ username: 'text', name: 'text' });

export const Account = mongoose.model('Account', schema);
