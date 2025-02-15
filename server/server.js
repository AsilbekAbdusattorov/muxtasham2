const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const ROOMS_FILE = path.join(__dirname, "rooms.json");

app.use(cors());
app.use(express.json());

// JSON fayl mavjudligini tekshirish va agar yo‘q bo‘lsa, yaratish
if (!fs.existsSync(ROOMS_FILE)) {
  fs.writeFileSync(ROOMS_FILE, JSON.stringify([], null, 2));
}

// Xonalarni yuklash funksiyasi
const loadRooms = () => {
  try {
    const data = fs.readFileSync(ROOMS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Faylni o‘qishda xatolik:", err);
    return [];
  }
};

// Xonalarni olish
app.get("/rooms", (req, res) => {
  const rooms = loadRooms();
  res.json(rooms);
});

// Xona band qilish
app.post("/book-room", (req, res) => {
  const { roomId, booking } = req.body;
  let rooms = loadRooms();

  const roomIndex = rooms.findIndex((room) => room.id === roomId);
  if (roomIndex === -1) {
    return res.status(404).json({ message: "Xona topilmadi" });
  }

  if (!Array.isArray(rooms[roomIndex].booked)) {
    rooms[roomIndex].booked = [];
  }

  rooms[roomIndex].booked.push(booking);

  // JSON faylni yangilash
  try {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
    res.json({ message: "Xona muvaffaqiyatli band qilindi!", room: rooms[roomIndex] });
  } catch (err) {
    console.error("Xonani yozishda xatolik:", err);
    res.status(500).json({ message: "Xatolik yuz berdi" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti...`);
});
