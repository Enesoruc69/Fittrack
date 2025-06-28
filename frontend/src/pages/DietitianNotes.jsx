import React, { useEffect, useState } from "react";
import axios from "axios";

const DietitianNotes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get("http://localhost:8080/api/dietitians/my-patients", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error("Hastalar alınamadı:", error);
    }
  };

  const fetchNotes = async () => {
    if (!selectedClientId) return;
    try {
      const token = localStorage.getItem("jwtToken");
const res = await axios.get(
  `http://localhost:8080/api/dietitians/notes/${selectedClientId}?page=${page}&size=${itemsPerPage}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

      setNotes(res.data?.content || []);
    } catch (error) {
      console.error("Notlar alınamadı:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedClientId) return;
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post(
        "http://localhost:8080/api/dietitians/notes",
        { clientId: selectedClientId, content: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewNote("");
      fetchNotes();
    } catch (error) {
      console.error("Not eklenemedi:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [selectedClientId, page]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Danışan Notları</h2>

      <div className="mb-4">
        <label className="font-semibold">Danışan Seç:</label>
        <select
          value={selectedClientId || ""}
          onChange={(e) => {
            setSelectedClientId(Number(e.target.value));
            setPage(0); // danışan değişince sayfayı sıfırla
          }}
          className="border p-2 rounded ml-2"
        >
          <option value="">Seçiniz</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      </div>

      {!selectedClientId ? (
        <div className="text-gray-600">Lütfen önce bir danışan seçiniz.</div>
      ) : (
        <>
          <textarea
            className="form-control"
            rows="3"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button className="btn btn-success mt-2" onClick={handleAddNote}>
            Not Ekle
          </button>

          <ul className="list-group mt-3">
            {notes.length === 0 ? (
              <li className="list-group-item">Henüz not eklenmedi.</li>
            ) : (
              notes.map((note, i) => (
                <li key={i} className="list-group-item">
                  <strong>{new Date(note.createdAt).toLocaleString()}:</strong> {note.content}
                </li>
              ))
            )}
          </ul>

          <div className="mt-2">
            <button
              className="btn btn-sm btn-outline-primary me-2"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Önceki
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setPage(page + 1)}
            >
              Sonraki
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DietitianNotes;
