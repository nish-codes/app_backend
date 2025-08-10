import mongoose from "mongoose"
import {Test} from "./test.model"
const questionSchema = new mongoose.Schema(
  {
    test_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Test',
    },
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['multiple_choice', 'coding_puzzle', 'scenario'],
    },
    options: {
      type: mongoose.Schema.Types.Mixed, // Using Mixed for flexibility
    },
    correct_answer: {
      type: mongoose.Schema.Types.Mixed, // Using Mixed for flexibility
      required: true,
    },
  },
);

export const Questions = mongoose.model("Questions", questionSchema);