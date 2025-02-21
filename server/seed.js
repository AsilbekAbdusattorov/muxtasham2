import mongoose from "mongoose";
import Room from "./rooms.js";

// MongoDB ulanishi
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://shop7347:Asilbek2007@cluster0.nob2u.mongodb.net/muhtasham?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB ga ulanish muvaffaqiyatli amalga oshirildi"))
  .catch((err) => console.error("❌ MongoDB ga ulanishda xatolik:", err));

// Ma'lumotlar
const roomsData = [
  {
    id: 1,
    name: "Xona 1",
    capacity: 20,
    booked: [],
    floor: "1",
  },
  {
    id: 2,
    name: "Xona 2",
    capacity: 18,
    booked: [],
    floor: "1",
  },
  {
    id: 3,
    name: "Xona 3",
    capacity: 18,
    booked: [],
    floor: "1",
  },
  {
    id: 4,
    name: "Xona 4",
    capacity: 15,
    booked: [],
    floor: "1",
  },
  {
    id: 5,
    name: "Xona 5",
    capacity: 25,
    booked: [],
    floor: "1",
  },
  {
    id: 6,
    name: "Xona 10",
    capacity: 25,
    booked: [],
    floor: "2",
  },
  {
    id: 7,
    name: "Xona 11",
    capacity: 25,
    booked: [],
    floor: "2",
  },
  {
    id: 8,
    name: "Xona 12",
    capacity: 15,
    booked: [],
    floor: "2",
  },
  {
    id: 9,
    name: "Xona 13",
    capacity: 10,
    booked: [],
    floor: "2",
  },
  {
    id: 10,
    name: "Xona 14",
    capacity: 15,
    booked: [],
    floor: "2",
  },
  {
    id: 11,
    name: "Xona 15",
    capacity: 12,
    booked: [],
    floor: "3",
  },
  {
    id: 12,
    name: "Xona 17",
    capacity: 12,
    booked: [],
    floor: "3",
  },
  {
    id: 13,
    name: "Xona 18",
    capacity: 15,
    booked: [],
    floor: "3",
  },
  {
    id: 14,
    name: "Xona 19",
    capacity: 10,
    booked: [],
    floor: "3",
  },
  {
    id: 15,
    name: "Xona 20",
    capacity: 15,
    booked: [],
    floor: "3",
  },
  {
    id: 16,
    name: "Podval so'ri 1",
    capacity: 8,
    booked: [],
    floor: "padval",
  },
  {
    id: 17,
    name: "Podval so'ri 2",
    capacity: 8,
    booked: [],
    floor: "padval",
  },
  {
    id: 18,
    name: "Podval so'ri 3",
    capacity: 8,
    booked: [],
    floor: "padval",
  },
  {
    id: 19,
    name: "Podval so'ri 4",
    capacity: 8,
    booked: [],
    floor: "padval",
  },
  {
    id: 20,
    name: "Podval so'ri 5",
    capacity: 8,
    booked: [],
    floor: "padval",
  },
  {
    id: 21,
    name: "Podval so'ri 6",
    capacity: 8,
    booked: [],
    floor: "padval",
  },
  {
    id: 22,
    name: "Podval so'ri 7",
    capacity: 8,
    booked: [],
    floor: "padval",
  },
  {
    id: 23,
    name: "Podval so'ri 8",
    capacity: 15,
    booked: [],
    floor: "padval",
  },
  {
    id: 24,
    name: "Podval so'ri 9",
    capacity: 8,
    booked: [],
    floor: "padval",
  },
  {
    id: 25,
    name: "Podval so'ri 10",
    capacity: 8,
    booked: [],
    floor: "padval",
  },
];

// Ma'lumotlarni MongoDB ga joylash
const seedDatabase = async () => {
  try {
    await Room.deleteMany({}); // Avvalgi ma'lumotlarni tozalash
    await Room.insertMany(roomsData); // Yangi ma'lumotlarni qo'shish
    console.log("✅ Ma'lumotlar muvaffaqiyatli qo'shildi!");
  } catch (err) {
    console.error("❌ Ma'lumotlarni qo'shishda xatolik:", err);
  } finally {
    mongoose.connection.close(); // Ulanishni yopish
  }
};

seedDatabase();