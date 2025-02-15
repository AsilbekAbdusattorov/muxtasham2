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

  const handleDeleteBooking = (roomId, booking) => {
    axios
      .delete(`https://muxtasham2-2.onrender.com/delete-booking/${roomId}`, {
        data: booking,
      })
      .then(() => {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId
              ? { ...room, booked: room.booked.filter((b) => b !== booking) }
              : room
          )
        );
        alert("Bandlik o‘chirildi!");
      })
      .catch((error) => {
        console.error(error);
        alert("Xatolik yuz berdi!");
      });
  };

  useEffect(() => {
    axios
      .get("https://muxtasham2-2.onrender.com/rooms")
      .then((response) => setRooms(response.data))
      .catch((error) => console.error("Xonalarni yuklashda xatolik:", error));
  }, []);

  const handleBookRoom = () => {
    if (!selectedRoom || !name.trim() || !phone.trim() || !date) {
      alert("Iltimos, barcha maydonlarni to‘ldiring!");
      return;
    }

    const newBooking = { name, phone, date, timeSlot };

    axios
      .post("https://muxtasham2-2.onrender.com/book-room", {
        roomId: selectedRoom.id,
        booking: newBooking,
      })
      .then(() => {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === selectedRoom.id
              ? { ...room, booked: [...(room.booked || []), newBooking] }
              : room
          )
        );
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

  const availableRooms = rooms.filter(
    (room) =>
      !room.booked ||
      !room.booked.some((b) => b.date === date && b.timeSlot === timeSlot)
  );

  const floors = [];
  for (let i = 0; i < rooms.length; i += 5) {
    floors.push(rooms.slice(i, i + 5));
  }
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Kirish uchun kodni kiriting</h2>
        <input
          type="text"
          maxLength="6"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          className="border p-2 rounded-md text-center text-xl mb-4"
        />
        <button
          onClick={() => {
            if (accessCode === "123456") {
              setIsAuthenticated(true);
            } else {
              alert("Noto‘g‘ri kod!");
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Tasdiqlash
        </button>
      </div>
    );
  }
  

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <h1 className="text-5xl text-center font-bold mb-10">Xonalar ro‘yxati</h1>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 border rounded-md mb-10 border-black"
      />

      <div className="flex justify-between mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            value="kunduzgi"
            checked={timeSlot === "kunduzgi"}
            onChange={() => setTimeSlot("kunduzgi")}
            className="mr-2 w-6 h-6"
          />
          Kunduzgi
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="kechgi"
            checked={timeSlot === "kechgi"}
            onChange={() => setTimeSlot("kechgi")}
            className="mr-2 w-6 h-6"
          />
          Kechgi
        </label>
      </div>

      {floors.map((floor, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-3xl font-bold mb-3">{index + 1}-qavat</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {floor.map((room) => {
              const bookedInfo = room.booked?.find(
                (b) => b.date === date && b.timeSlot === timeSlot
              );
              const isBooked = !!bookedInfo;

              return (
                <li
                  key={room.id}
                  className={`p-5 border rounded-2xl shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    isBooked
                      ? "bg-red-400 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-bold">{room.name}</h3>
                    <p className="text-sm">Sig‘imi: {room.capacity} kishi</p>

                    {/* Agar xona band qilingan bo‘lsa, kim band qilganligini ko‘rsatish */}
                    {isBooked && (
                      <p className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-md">
                        <strong>Band qilgan:</strong> {bookedInfo.name}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Modal oynasi */}
      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsModalOpen(false)}
            >
              ✖
            </button>
            <h2 className="text-lg font-bold mb-2">
              {selectedRoom.name} ni band qilish
            </h2>

            {/* Band qilingan bo'lsa, foydalanuvchini ko'rsatish */}
            {selectedRoom.booked?.some(
              (b) => b.date === date && b.timeSlot === timeSlot
            ) && (
              <div className="bg-yellow-200 p-2 rounded-md mb-2">
                <p className="text-sm text-gray-800">
                  <strong>Band qilgan:</strong>{" "}
                  {
                    selectedRoom.booked.find(
                      (b) => b.date === date && b.timeSlot === timeSlot
                    ).name
                  }
                </p>
                <p className="text-sm text-gray-800">
                  <strong>Telefon:</strong>{" "}
                  {
                    selectedRoom.booked.find(
                      (b) => b.date === date && b.timeSlot === timeSlot
                    ).phone
                  }
                </p>
              </div>
            )}

            <input
              type="text"
              placeholder="Ism va familiya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
            />
            <input
              type="tel"
              placeholder="Telefon raqami"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
            />

            <div className="flex justify-between mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="kunduzgi"
                  checked={timeSlot === "kunduzgi"}
                  onChange={() => setTimeSlot("kunduzgi")}
                  className="mr-2"
                />
                Kunduzgi
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="kechgi"
                  checked={timeSlot === "kechgi"}
                  onChange={() => setTimeSlot("kechgi")}
                  className="mr-2"
                />
                Kechgi
              </label>
            </div>

            <button
              onClick={handleBookRoom}
              className="w-full mt-3 bg-blue-500 text-white py-2 rounded-md"
            >
              Tasdiqlash
            </button>

            {/* Bandlikni o'chirish tugmasi */}
            {selectedRoom.booked?.some(
              (b) => b.date === date && b.timeSlot === timeSlot
            ) && (
              <button
                onClick={() =>
                  handleDeleteBooking(
                    selectedRoom.id,
                    selectedRoom.booked.find(
                      (b) => b.date === date && b.timeSlot === timeSlot
                    )
                  )
                }
                className="w-full mt-3 bg-red-500 text-white py-2 rounded-md"
              >
                Bandlikni o‘chirish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
