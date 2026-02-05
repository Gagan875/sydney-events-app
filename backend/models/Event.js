const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,

  dateTime: Date,

  venueName: String,
  venueAddress: String,
  city: {
    type: String,
    default: "Sydney"
  },

  category: String,
  imageUrl: String,

  sourceName: String,
  originalUrl: {
    type: String,
    unique: true
  },

  lastScrapedAt: Date,

  status: {
    type: String,
    enum: ["new", "updated", "inactive", "imported"],
    default: "new"
  },

  // Track changes
  contentHash: String,

  // Import tracking
  importedAt: Date,
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  importNotes: String

}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
