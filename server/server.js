import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// __dirname ni ES module'da ishlash uchun
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const ROOMS_FILE = path.join(__dirname, "rooms.json");

app.use(cors());
app.use(express.json());

// JSON fayl mavjudligini tekshirish
if (!fs.existsSync(ROOMS_FILE)) {
  fs.writeFileSync(ROOMS_FILE, JSON.stringify([], null, 2));
}

// Xonalarni yuklash funksiyasi
const loadRooms = () => {
  try {
    const data = fs.readFileSync(ROOMS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Faylni o‘qishda xatolik:", err);
    return [];
  }
};

// Xonalarni saqlash funksiyasi
const saveRooms = (rooms) => {
  try {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
  } catch (err) {
    console.error("❌ Faylni yozishda xatolik:", err);
  }
};

// ✅ Barcha xonalarni olish
app.get("/rooms", (req, res) => {
  const rooms = loadRooms();
  res.json(rooms);
});

// ✅ Xona band qilish
app.post("/book-room", (req, res) => {
  try {
    const { roomId, booking } = req.body;
    let rooms = loadRooms();

    const roomIndex = rooms.findIndex((room) => String(room.id) === String(roomId));
    if (roomIndex === -1) {
      console.error("❌ Xona topilmadi:", roomId);
      return res.status(404).json({ message: "Xona topilmadi" });
    }

    if (!Array.isArray(rooms[roomIndex].booked)) {
      rooms[roomIndex].booked = [];
    }

    rooms[roomIndex].booked.push(booking);

    // JSON faylni yangilash
    saveRooms(rooms);

    console.log(`✅ Xona band qilindi: ${roomId}`);
    res.json({
      message: "Xona muvaffaqiyatli band qilindi!",
      room: rooms[roomIndex],
    });
  } catch (err) {
    console.error("❌ Xonani band qilishda xatolik:", err);
    res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
  }
});

// ✅ Bandlikni o‘chirish (roomId va bookingId bo‘yicha)
app.delete("/delete-booking/:roomId/:bookingId", (req, res) => {
  try {
    const { roomId, bookingId } = req.params;
    let rooms = loadRooms();

    const roomIndex = rooms.findIndex((room) => String(room.id) === String(roomId));
    if (roomIndex === -1) {
      return res.status(404).json({ message: "Xona topilmadi" });
    }

    const bookingIndex = rooms[roomIndex].booked.findIndex(
      (b) => String(b.id) === String(bookingId)
    );

    if (bookingIndex === -1) {
      return res.status(404).json({ message: "❌ Xatolik: bookingId topilmadi!" });
    }

    // Bandlikni olib tashlash
    rooms[roomIndex].booked.splice(bookingIndex, 1);

    // JSON faylni yangilash
    saveRooms(rooms);

    console.log(`✅ Bandlik (${bookingId}) muvaffaqiyatli o‘chirildi.`);
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
