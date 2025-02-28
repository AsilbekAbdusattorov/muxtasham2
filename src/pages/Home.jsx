import { useState, useEffect } from "react";
import axios from "axios";

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Bugungi sana
  const [timeSlot, setTimeSlot] = useState("kunduzgi");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal holati
  const [accessCode, setAccessCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bandlikni o'chirish
  const handleDeleteBooking = (roomId, bookingId) => {
    if (!bookingId || bookingId.trim() === "") {
      alert("Xatolik: bookingId topilmadi!");
      return;
    }

    axios
      .delete(`https://muxtasham2-2.onrender.com/delete-booking/${roomId}/${bookingId}`)
      .then(() => {
        fetchRooms(); // Xonalarni qayta yuklash
        alert("✅ Bandlik o‘chirildi!");
      })
      .catch((error) => {
        console.error("❌ Xatolik:", error);
        alert("Xatolik yuz berdi!");
      });
  };

  // Xonani band qilish
  const handleBookRoom = () => {
    if (!selectedRoom || !name.trim() || !date) {
      alert("Iltimos, ism va sana maydonlarini to‘ldiring!");
      return;
    }

    const newBooking = {
      guestName: name,
      checkIn: new Date(`${date}T10:00:00Z`), // ISO formatda sanani yuborish
      checkOut: new Date(`${date}T18:00:00Z`), // ISO formatda sanani yuborish
    };

    axios
      .post("https://muxtasham2-2.onrender.com/book-room", {
        roomId: selectedRoom._id, // MongoDB ObjectId
        ...newBooking,
      })
      .then(() => {
        fetchRooms(); // Xonalarni qayta yuklash
        setIsModalOpen(false);
        setSelectedRoom(null);
        setName("");
        setPhone("");
        setDate(new Date().toISOString().split("T")[0]);
        setTimeSlot("kunduzgi");
        alert("Xona muvaffaqiyatli band qilindi!");
      })
      .catch((error) => {
        console.error(error);
        alert("Xatolik yuz berdi!");
      });
  };

  // Xonalarni yuklash
  const fetchRooms = () => {
    setLoading(true); // Yuklanishni boshlash
    axios
      .get("https://muxtasham2-2.onrender.com/rooms")
      .then((response) => {
        setRooms(response.data); // Xonalarni yangilash
      })
      .catch((error) => {
        console.error("❌ Xonalarni yuklashda xatolik:", error);
      })
      .finally(() => {
        setLoading(false); // Yuklanish tugadi
      });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Qavatlar va xonalarni ajratish
  const floors = [];
  let floorRoomCount = [5, 10, 10]; // 2-chi qavatda 5 ta xona, 3-chi qavatda 10 ta xona, Padvalda 10 ta xona
  let roomIndex = 0;

  for (let i = 0; i < floorRoomCount.length; i++) {
    const roomCount = floorRoomCount[i];
    floors.push(rooms.slice(roomIndex, roomIndex + roomCount));
    roomIndex += roomCount; // Keyingi qavat uchun indeksni yangilash
  }

  // Kirish kodi tekshirish
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Kirish</h2>
          <p className="text-gray-500 mb-6">Iltimos, kirish kodini kiriting</p>
          <input
            type="text"
            maxLength="6"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className={`w-full p-3 border-2 rounded-md text-center text-xl transition-all ${
              accessCode && accessCode !== "0021"
                ? "border-red-500 focus:border-red-700"
                : "border-gray-300 focus:border-blue-500"
            }`}
            placeholder="****"
          />
          <button
            onClick={() => {
              if (accessCode === "0021") {
                setIsAuthenticated(true);
              } else {
                alert("❌ Noto‘g‘ri kod!");
              }
            }}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md text-lg font-semibold transition-all hover:bg-blue-700 active:scale-95"
          >
            Tasdiqlash
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-blue-100 to-blue-50">
      <div className="p-5 max-w-7xl mx-auto min-h-screen">
        <h1 className="text-5xl text-center font-bold mb-10 text-blue-800 drop-shadow-lg">
          Muhtasham xonalari
        </h1>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border-2 rounded-lg mb-6 border-blue-400 text-gray-700 shadow-md focus:border-blue-600 focus:ring focus:ring-blue-200 transition-all"
        />

        <div className="flex justify-center space-x-6">
          <label className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition">
            <input
              type="radio"
              value="kunduzgi"
              checked={timeSlot === "kunduzgi"}
              onChange={() => setTimeSlot("kunduzgi")}
              className="hidden"
            />
            <span
              className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                timeSlot === "kunduzgi"
                  ? "bg-blue-500 border-blue-700"
                  : "border-gray-400"
              }`}
            >
              {timeSlot === "kunduzgi" && (
                <span className="w-3 h-3 bg-white rounded-full"></span>
              )}
            </span>
            <span className="text-gray-700 font-medium">Kunduzgi</span>
          </label>

          <label className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition">
            <input
              type="radio"
              value="kechgi"
              checked={timeSlot === "kechgi"}
              onChange={() => setTimeSlot("kechgi")}
              className="hidden"
            />
            <span
              className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                timeSlot === "kechgi"
                  ? "bg-blue-500 border-blue-700"
                  : "border-gray-400"
              }`}
            >
              {timeSlot === "kechgi" && (
                <span className="w-3 h-3 bg-white rounded-full"></span>
              )}
            </span>
            <span className="text-gray-700 font-medium">Kechgi</span>
          </label>
        </div>

        {loading ? (
          <div className="text-center text-2xl font-bold animate-pulse text-blue-600">
            ⏳ Yuklanmoqda...
          </div>
        ) : (
          floors.map((floor, index) => {
            const isPadval = index === 2; // Padval faqat 3-chi qavatda (index 2)

            return (
              <div key={index} className="mb-10">
                <h2 className="text-3xl font-bold mb-5 text-blue-700">
                  {isPadval ? "Padval" : `${index + 2}-qavat`}
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {floor.map((room) => {
                    const bookedInfo = room.booked?.find((b) => {
                      const checkInDate = new Date(b.checkIn).toISOString().split("T")[0];
                      return checkInDate === date;
                    });
                    const isBooked = !!bookedInfo;

                    return (
                      <li
                        key={room._id}
                        className={`p-6 border rounded-2xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          isBooked
                            ? "bg-red-500 text-white shadow-red-400"
                            : "bg-white text-gray-900 border-gray-300 hover:border-blue-500"
                        }`}
                        onClick={() => {
                          setSelectedRoom(room);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="flex flex-col space-y-3">
                          <h3 className="text-xl font-bold">{room.name}</h3>
                          <p className="text-sm text-gray-700">
                            🏠 Sig‘imi: <strong>{room.capacity} kishi</strong>
                          </p>
                          {isBooked && (
                            <p className="text-sm bg-white bg-opacity-25 px-3 py-2 rounded-lg shadow-md">
                              🔒 <strong>Band qilgan:</strong> {bookedInfo.guestName}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}

        {/* Modal oynasi */}
        {isModalOpen && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 transition"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>
              <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
                {selectedRoom.name} ni band qilish
              </h2>

              {/* Band qilingan bo'lsa, foydalanuvchi ma'lumotlarini ko‘rsatish */}
              {selectedRoom.booked?.some((b) => {
                const checkInDate = new Date(b.checkIn).toISOString().split("T")[0];
                return checkInDate === date;
              }) && (
                <div className="bg-yellow-100 p-3 rounded-lg shadow-sm mb-4">
                  <p className="text-sm text-gray-800 font-medium">
                    📌 <strong>Band qilgan:</strong>{" "}
                    {
                      selectedRoom.booked.find((b) => {
                        const checkInDate = new Date(b.checkIn).toISOString().split("T")[0];
                        return checkInDate === date;
                      }).guestName
                    }
                  </p>
                </div>
              )}

              {/* Forma maydonlari */}
              <input
                type="text"
                placeholder="Ism va familiya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 border rounded-md mb-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="tel"
                placeholder="Telefon raqami (ixtiyoriy)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border rounded-md mb-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-3 border rounded-md mb-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />

              {/* Tasdiqlash tugmasi */}
              <button
                onClick={handleBookRoom}
                className="w-full mt-3 bg-blue-500 text-white py-3 rounded-md shadow-md hover:bg-blue-600 transition"
              >
                ✅ Tasdiqlash
              </button>

              {/* Bandlikni o‘chirish tugmasi */}
              {selectedRoom.booked?.some((b) => {
                const checkInDate = new Date(b.checkIn).toISOString().split("T")[0];
                return checkInDate === date;
              }) && (
                <button
                  onClick={() =>
                    handleDeleteBooking(
                      selectedRoom._id,
                      selectedRoom.booked.find((b) => {
                        const checkInDate = new Date(b.checkIn).toISOString().split("T")[0];
                        return checkInDate === date;
                      })._id
                    )
                  }
                  className="w-full mt-3 bg-red-500 text-white py-3 rounded-md shadow-md hover:bg-red-600 transition"
                >
                  ❌ Bandlikni o‘chirish
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Home;