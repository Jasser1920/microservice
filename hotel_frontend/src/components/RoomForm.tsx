import { useState } from "react";

interface RoomFormProps {
  onSubmit: (room: Room) => void;
  initial?: Room;
}

interface Room {
  roomNumber: string;
  type: string;
  status: string;
  capacity: number;
  pricePerNight: number;
  floor: number;
}

export default function RoomForm({ onSubmit, initial }: RoomFormProps) {
  const [form, setForm] = useState<Room>(initial || {
    roomNumber: "",
    type: "SINGLE",
    status: "AVAILABLE",
    capacity: 1,
    pricePerNight: 0,
    floor: 1
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "number" ? Number(value) : value
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input name="roomNumber" value={form.roomNumber} onChange={handleChange} placeholder="Room Number" required />{' '}
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="SINGLE">SINGLE</option>
        <option value="DOUBLE">DOUBLE</option>
        <option value="SUITE">SUITE</option>
      </select>{' '}
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="AVAILABLE">AVAILABLE</option>
        <option value="OCCUPIED">OCCUPIED</option>
        <option value="MAINTENANCE">MAINTENANCE</option>
      </select>{' '}
      <input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="Capacity" min={1} required />{' '}
      <input name="pricePerNight" type="number" value={form.pricePerNight} onChange={handleChange} placeholder="Price/Night" min={0} required />{' '}
      <input name="floor" type="number" value={form.floor} onChange={handleChange} placeholder="Floor" min={1} required />{' '}
      <button type="submit">{initial ? "Update" : "Create"} Room</button>
    </form>
  );
}
