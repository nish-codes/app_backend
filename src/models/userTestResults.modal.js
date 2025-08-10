import mongoose from "mongoose";

const userTestResultSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    test_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    start_time: {
      type: Date,
      required: true,
      default: Date.now,
    },
    end_time: {
      type: Date,
    },
    score: {
      type: Number,
      default: 0,
    },
    level_achieved: {
      type: String,
      // You can use an enum here if the levels are predefined, e.g.,
      // enum: ['A', 'B', 'C', 'D', 'E'],
    },
    badge_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
    },
    is_valid: {
      type: Boolean,
      default: false,
    },
  },
);

export const UserTestResult = mongoose.model('UserTestResult', userTestResultSchema);

