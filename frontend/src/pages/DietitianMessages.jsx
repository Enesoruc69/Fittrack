import React, { useEffect, useState } from "react";
import axios from "axios";

const DietitianMessages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clients, setClients] = useState([]);

  const token = localStorage.getItem("jwtToken");

  // Diyetisyene atanmış hastaları getir
  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/dietitians/my-patients", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error("Hastalar alınamadı:", error);
    }
  };

  // Seçili hastayla olan mesajlar
  const fetchMessages = async () => {
    if (!selectedClientId) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/messages/dietitian/${selectedClientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Mesajlar alınamadı:", error);
    }
  };

  const sendMessage = async () => {
    if (!selectedClientId || !newMessage) return;
    try {
      await axios.post("http://localhost:8080/api/messages/dietitian/send", {
        clientId: selectedClientId,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Mesaj gönderilemedi:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [selectedClientId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Hasta Mesajları</h2>

      <div className="mb-4">
        <label className="font-semibold">Hasta Seç:</label>
        <select
          value={selectedClientId || ""}
          onChange={(e) => setSelectedClientId(Number(e.target.value))}
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

      <div className="border rounded p-4 h-64 overflow-y-auto bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 p-2 rounded ${msg.senderName !== "Me" ? "bg-green-200 ml-auto text-right" : "bg-blue-200"
              }`}
          >
            <strong>{msg.senderName}:</strong> {msg.content}
            <div className="text-xs text-gray-600">
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex">
        <input
          type="text"
          className="flex-grow border rounded p-2"
          placeholder="Mesaj yaz..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-black rounded"
        >
          Gönder
        </button>
      </div>
    </div>
  );
};

export default DietitianMessages;
