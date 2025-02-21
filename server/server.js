import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB ulanishi
const MONGO_URI = "mongodb+srv://shop7347:Asilbek2007@cluster0.nob2u.mongodb.net/muhtasham?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB ga ulanish muvaffaqiyatli amalga oshirildi"))
  .catch((err) => console.error("❌ MongoDB ga ulanishda xatolik:", err));

// Modellar
const bookingSchema = new mongoose.Schema({
  guestName: String,
  checkIn: Date,
  checkOut: Date,
});

const roomSchema = new mongoose.Schema({
  name: String,
  booked: [bookingSchema],
});

const Room = mongoose.model("Room", roomSchema);

// Middleware
app.use(cors());
app.use(express.json());

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

    // Yangi bandlik yaratish
    const newBooking = { guestName, checkIn, checkOut };

    // Xonani topib, bandlikni qo'shish
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Xona topilmadi" });
    }

    room.booked.push(newBooking);
    await room.save();

    res.json({
      message: "Xona muvaffaqiyatli band qilindi!",
      room,
    });
  } catch (err) {
    console.error("❌ Xonani band qilishda xatolik:", err);
    res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
  }
});

// ✅ Bandlikni o‘chirish (roomId va bookingId bo‘yicha)
app.delete("/delete-booking/:roomId/:bookingId", async (req, res) => {
  try {
    const { roomId, bookingId } = req.params;

    // Xonani topish
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Xona topilmadi" });
    }

    // Bandlikni topib, o'chirish
    room.booked = room.booked.filter(
      (booking) => booking._id.toString() !== bookingId
    );
    await room.save();

    res.json({ message: "Bandlik muvaffaqiyatli o‘chirildi!" });
  } catch (err) {
    console.error("❌ Bandlikni o‘chirishda xatolik:", err);
    res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
  }
});

// ✅ Server xatolarini ushlash
app.use((err, req, res, next) => {
  console.error("❌ Server xatosi:", err);
  res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
});

// ✅ Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti...`);
});