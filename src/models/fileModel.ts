import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  fileName: {
    type: String,
  },
});

export const File = mongoose.model('file', schema);
