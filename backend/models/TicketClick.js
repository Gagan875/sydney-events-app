const mongoose = require("mongoose");

const ticketClickSchema = new mongoose.Schema({
  email: String,
  consent: Boolean,

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  }

}, { timestamps: true });

module.exports = mongoose.model("TicketClick", ticketClickSchema);
