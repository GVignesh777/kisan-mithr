const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop",
  },
  category: {
    type: String,
    enum: ["Seeds", "Fertilizers", "Pesticides", "Labor", "Equipment", "Irrigation", "Transport", "Other"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
