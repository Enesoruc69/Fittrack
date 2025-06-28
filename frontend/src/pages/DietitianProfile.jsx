import React, { useEffect, useState } from "react";
import axios from "axios";

const DietitianProfile = () => {
  const [dietitianData, setDietitianData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDietitianProfile = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get("http://localhost:8080/api/dietitians/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDietitianData({
          ...response.data,
          password: "",
        });
      } catch (error) {
        console.error("Profil verisi alınamadı:", error);
      }
    };

    fetchDietitianProfile();
  }, []);

  const handleChange = (e) => {
    setDietitianData({ ...dietitianData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtToken");
      const updateData = { ...dietitianData };
      if (!updateData.password) {
        delete updateData.password;
      }

      await axios.put("http://localhost:8080/api/dietitians/profile/update", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Profil başarıyla güncellendi!");
      setDietitianData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      setMessage("Bir hata oluştu. Tekrar deneyin.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>👩‍⚕️ Diyetisyen Profilim</h3>
      {message && <div className="alert alert-info mt-2">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Ad</label>
          <input type="text" className="form-control" name="firstName" value={dietitianData.firstName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Soyad</label>
          <input type="text" className="form-control" name="lastName" value={dietitianData.lastName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>E-mail</label>
          <input type="email" className="form-control" name="email" value={dietitianData.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Şifre (Değiştirmek istemiyorsanız boş bırakın)</label>
          <input type="password" className="form-control" name="password" value={dietitianData.password} onChange={handleChange} placeholder="Yeni şifre" />
        </div>
        <button type="submit" className="btn btn-primary">Güncelle</button>
      </form>
    </div>
  );
};

export default DietitianProfile;
