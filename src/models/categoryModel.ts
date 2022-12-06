import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: {
    type: String,
  },
});

schema.index({ name: 'text' });

export const Category = mongoose.model('Category', schema);
