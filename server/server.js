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
    let rooms = JSON.parse(data);
    
    // Har bir xonaga `booked` maydonini qo‘shish
    rooms = rooms.map((room) => ({
      ...room,
      booked: room.booked || [],
    }));

    return rooms;
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

// 📌 **Barcha xonalarni olish**
app.get("/rooms", (req, res) => {
  const rooms = loadRooms();
  res.json(rooms);
});

// 📌 **Xona band qilish**
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

    // ✅ Bandlikka noyob `id` qo‘shish
    const newBooking = { id: Date.now().toString(), ...booking };
    rooms[roomIndex].booked.push(newBooking);

    // JSON faylni yangilash
    saveRooms(rooms);

    console.log(`✅ Xona band qilindi: ${roomId}`);
    res.json({
      message: "Xona muvaffaqiyatli band qilindi!",
      booking: newBooking, // Faqat bandlikni qaytaramiz
    });
  } catch (err) {
    console.error("❌ Xonani band qilishda xatolik:", err);
    res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
  }
});

// 📌 **Bandlikni o‘chirish (roomId va bookingId bo‘yicha)**
app.delete("/delete-booking/:roomId/:bookingId", (req, res) => {
  try {
    const { roomId, bookingId } = req.params;
    let rooms = loadRooms();

    const roomIndex = rooms.findIndex((room) => String(room.id) === String(roomId));
    if (roomIndex === -1) {
      return res.status(404).json({ message: "Xona topilmadi" });
    }

    const initialLength = rooms[roomIndex].booked.length;
    rooms[roomIndex].booked = rooms[roomIndex].booked.filter(
      (b) => String(b.id) !== String(bookingId)
    );

    if (rooms[roomIndex].booked.length === initialLength) {
      return res.status(404).json({ message: "Bandlik topilmadi" });
    }

    // Yangilangan ma'lumotni JSON faylga yozish
    saveRooms(rooms);

    console.log(`✅ Bandlik (${bookingId}) o‘chirildi`);
    res.json({ message: "Bandlik muvaffaqiyatli o‘chirildi!" });
  } catch (err) {
    console.error("❌ Xatolik:", err);
    res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
  }
});

// 📌 **Server xatolarini ushlash**
app.use((err, req, res, next) => {
  console.error("❌ Server xatosi:", err);
  res.status(500).json({ message: "Ichki server xatosi yuz berdi" });
});

// 📌 **Serverni ishga tushirish**
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti...`);
});
