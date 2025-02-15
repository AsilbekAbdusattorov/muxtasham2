const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const ROOMS_FILE = "rooms.json";

app.use(cors());
app.use(express.json());

// Xonalarni yuklash funksiyasi
const loadRooms = () => {
  try {
    const data = fs.readFileSync(ROOMS_FILE);
    return JSON.parse(data);
  } catch (err) {
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
  const { roomId, booking } = req.body;
  let rooms = loadRooms();

  const roomIndex = rooms.findIndex((room) => room.id === roomId);
  if (roomIndex === -1) {
    return res.status(404).json({ message: "Xona topilmadi" });
  }

  if (!rooms[roomIndex].booked) {
    rooms[roomIndex].booked = [];
  }
  rooms[roomIndex].booked.push(booking);

  fs.writeFile(ROOMS_FILE, JSON.stringify(rooms, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ message: "Xatolik yuz berdi" });
    }
    res.json({ message: "Xona muvaffaqiyatli band qilindi!", room: rooms[roomIndex] });
  });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlayapti...`);
});