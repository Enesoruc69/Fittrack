import React, { useEffect, useState } from "react";
import axios from "axios";

const ClientMessages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchMessages = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/messages", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
        }
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Mesajlar alınamadı:", error);
    }
  };

  const sendMessage = async () => {
    try {
      await axios.post("http://localhost:8080/api/messages/send", {
        content: newMessage
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
        }
      });
      setNewMessage("");
      fetchMessages(); // gönderince güncelle
    } catch (error) {
      console.error("Mesaj gönderilemedi:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Mesajlarım</h2>
      <div className="border rounded p-4 h-64 overflow-y-auto bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`my-2 p-2 rounded ${msg.senderName === "Me" ? "bg-green-200 ml-auto text-right" : "bg-blue-200"}`}>
            <strong>{msg.senderName}:</strong> {msg.content}
            <div className="text-xs text-gray-600">{new Date(msg.timestamp).toLocaleString()}</div>
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
        <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-500 text-black rounded">
          Gönder
        </button>
      </div>
    </div>
  );
};

export default ClientMessages;
