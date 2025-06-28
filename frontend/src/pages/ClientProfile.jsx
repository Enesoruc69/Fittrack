import React, { useEffect, useState } from "react";
import axios from "axios";

const ClientProfile = () => {
  const [clientData, setClientData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get("http://localhost:8080/api/clients/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;

        console.log("GELEN PROFİL:", data); // Debug için

        setClientData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          password: "",
          age: data.age || "",
          gender: data.gender || "",
          dietitianName: data.dietitianName || "",
          dietTypeName: data.dietTypeName || "",
        });
      } catch (error) {
        console.error("Profil verisi alınamadı:", error);
        setMessage("Profil verisi alınamadı.");
      }
    };

    fetchClientProfile();
  }, []);

  const handleChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtToken");

      const updateData = {
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        age: clientData.age,
        gender: clientData.gender,
      };

      if (clientData.password) {
        updateData.password = clientData.password;
      }

      await axios.put("http://localhost:8080/api/clients/profile/update", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Profil başarıyla güncellendi!");
      setClientData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  if (!clientData) {
    return <div className="container mt-4">Profil yükleniyor...</div>;
  }

  return (
    <div className="container mt-4">
      <h3>👤 Danışan Profilim</h3>
      {message && <div className="alert alert-info mt-2">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Ad</label>
          <input
            type="text"
            className="form-control"
            name="firstName"
            value={clientData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Soyad</label>
          <input
            type="text"
            className="form-control"
            name="lastName"
            value={clientData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>E-mail</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={clientData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Şifre (Değiştirmek istemiyorsanız boş bırakın)</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={clientData.password}
            onChange={handleChange}
            placeholder="Yeni şifre"
          />
        </div>
        <div className="mb-3">
          <label>Yaş</label>
          <input
            type="number"
            className="form-control"
            name="age"
            value={clientData.age}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label>Cinsiyet</label>
          <input
            type="text"
            className="form-control"
            name="gender"
            value={clientData.gender}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label>Diyetisyen</label>
          <input
            type="text"
            className="form-control"
            name="dietitianName"
            value={clientData.dietitianName}
            disabled
          />
        </div>
        <div className="mb-3">
          <label>Diyet Tipi</label>
          <input
            type="text"
            className="form-control"
            name="dietTypeName"
            value={clientData.dietTypeName}
            disabled
          />
        </div>
        <button type="submit" className="btn btn-success">
          Güncelle
        </button>
      </form>
    </div>
  );
};

export default ClientProfile;
