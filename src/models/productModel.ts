import mongoose, { Schema } from 'mongoose';

const schema = new mongoose.Schema({
  categoryId: {
    type: Schema.Types.ObjectId,
  },
  batchId: {
    type: Schema.Types.ObjectId,
  },
  divisionId: {
    type: Schema.Types.ObjectId,
  },
  isDefective: {
    type: Number,
    default: 1,
    enum: [1, 2, 3, 4],
    // 1-not defective, 2-isdefect, 3-defect-but-with-batch, 4-insurrance-expire-
  },
  defectiveDetail: {
    type: String,
  },
  manufacturerId: {
    type: Schema.Types.ObjectId,
  },
  sellerId: {
    type: Schema.Types.ObjectId,
  },
  insurrancerId: {
    type: Schema.Types.ObjectId,
  },
  insurranceTime: {
    type: Number,
    default: 0,
  },
  customerName: {
    type: String,
  },
  customerAddress: {
    type: String,
  },
  buyDate: {
    type: Date,
  },
  changeDate: {
    type: Date,
  },
  note: {
    type: String,
  },
  state: {
    type: Number,
  },
  productImage: {
    fileName: { type: String },
    fileKey: { type: Schema.Types.ObjectId },
  },
});

schema.index({ tierName: 'text' });

export const Product = mongoose.model('Product', schema);
