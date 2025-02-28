import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔍 MongoDB ulanishi
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI .env faylda mavjud emas!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB muvaffaqiyatli ulandi!"))
  .catch((err) => {
    console.error("❌ MongoDB ulanishida xatolik:", err.message);
    process.exit(1);
  });

// ✅ Asosiy sahifa uchun route
app.get("/", (req, res) => {
  res.send("Xush kelibsiz! Server ishlayapti 🚀");
});

// Middleware
app.use(cors());
app.use(express.json());

// 🔥 Modellar
const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
});

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  booked: [bookingSchema],
});

const Room = mongoose.model("Room", roomSchema);

// ✅ Barcha xonalarni olish
app.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    console.error("❌ Xonalarni yuklashda xatolik:", err);
    res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
  }
});

// ✅ Xona band qilish
app.post("/book-room", async (req, res) => {
  try {
    const { roomId, guestName, checkIn, checkOut } = req.body;
    if (!roomId || !guestName || !checkIn || !checkOut) {
      return res.status(400).json({ message: "Barcha maydonlar to‘ldirilishi shart" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Xona topilmadi" });
    }

    const newBooking = { guestName, checkIn, checkOut };
    room.booked.push(newBooking);
    await room.save();

    res.json({ message: "Xona muvaffaqiyatli band qilindi!", room });
  } catch (err) {
    console.error("❌ Xonani band qilishda xatolik:", err);
    res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
  }
});

// ✅ Bandlikni o‘chirish
app.delete("/delete-booking/:roomId/:bookingId", async (req, res) => {
  try {
    const { roomId, bookingId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Xona topilmadi" });
    }

    const initialLength = room.booked.length;
    room.booked = room.booked.filter((booking) => booking._id.toString() !== bookingId);

    if (room.booked.length === initialLength) {
      return res.status(404).json({ message: "Bandlik topilmadi" });
    }

    await room.save();
    res.json({ message: "Bandlik muvaffaqiyatli o‘chirildi!" });
  } catch (err) {
    console.error("❌ Bandlikni o‘chirishda xatolik:", err);
    res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
  }
});

// ✅ Xatolarni ushlash
app.use((err, req, res, next) => {
  console.error("❌ Server xatosi:", err);
  res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
});

// ✅ Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti...`);
});
