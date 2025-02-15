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

// Barcha xonalarni olish
app.get("/rooms", (req, res) => {
  const rooms = loadRooms();
  res.json(rooms);
});

// Xona band qilish
app.post("/book-room", (req, res) => {
  try {
    const { roomId, booking } = req.body;
    let rooms = loadRooms();

    const roomIndex = rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) {
      console.error("❌ Xona topilmadi:", roomId);
      return res.status(404).json({ message: "Xona topilmadi" });
    }

    if (!Array.isArray(rooms[roomIndex].booked)) {
      rooms[roomIndex].booked = [];
    }

    rooms[roomIndex].booked.push(booking);

    // JSON faylni yangilash
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));

    console.log(`✅ Xona band qilindi: ${roomId}`);
    res.json({ message: "Xona muvaffaqiyatli band qilindi!", room: rooms[roomIndex] });
  } catch (err) {
    console.error("❌ Xonani band qilishda xatolik:", err);
    res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
  }
});

// Server xatolarini ushlash
app.use((err, req, res, next) => {
  console.error("❌ Server xatosi:", err);
  res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
});

app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti...`);
});
