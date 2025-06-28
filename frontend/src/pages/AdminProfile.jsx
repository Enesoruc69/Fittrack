import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminProfile = () => {
  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get("http://localhost:8080/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminData({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          email: response.data.email || "",
          password: "",  // şifre API'den gelmiyor, boş bırakıyoruz
        });
      } catch (error) {
        console.error("Profil verisi alınamadı:", error);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtToken");

      // Şifre boş ise update isteğine dahil etme
      const updateData = { ...adminData };
      if (!updateData.password) {
        delete updateData.password;
      }

      await axios.put("http://localhost:8080/api/admin/profile/update", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Profil başarıyla güncellendi!");

      // Şifreyi formdan temizle
      setAdminData(prev => ({ ...prev, password: "" }));
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      setMessage("Bir hata oluştu. Tekrar deneyin.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>👤 Profil Bilgilerim</h3>
      {message && <div className="alert alert-info mt-2">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Ad</label>
          <input
            type="text"
            className="form-control"
            name="firstName"
            value={adminData.firstName}
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
            value={adminData.lastName}
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
            value={adminData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Şifre (Değiştirmek istemiyorsanız boş bırakabilirsiniz)</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={adminData.password}
            onChange={handleChange}
            placeholder="Yeni şifre"
          />
        </div>
        <button type="submit" className="btn btn-primary">Güncelle</button>
      </form>
    </div>
  );
};

export default AdminProfile;
