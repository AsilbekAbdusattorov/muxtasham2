import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  booked: [
    {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      date: { type: String, required: true },
      timeSlot: { type: String, required: true },
    },
  ],
  floor: { type: String, required: true },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;