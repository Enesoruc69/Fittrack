// src/pages/AddUser.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function AddUser() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    userType: "CLIENT",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("jwtToken");

    try {
      await axios.post("http://localhost:8080/api/admin/create-user", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Kullanıcı başarıyla eklendi!");
      setTimeout(() => navigate("/admin-dashboard"), 1500);
    } catch (err) {
      toast.error("Ekleme başarısız.");
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-4 text-primary">Yeni Kullanıcı Ekle</h3>
      <div className="row g-3">
        <div className="col-md-6">
          <input className="form-control" name="firstName" placeholder="Ad" value={formData.firstName} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <input className="form-control" name="lastName" placeholder="Soyad" value={formData.lastName} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <input className="form-control" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <input type="password" className="form-control" name="password" placeholder="Şifre" value={formData.password} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <input className="form-control" name="age" placeholder="Yaş" value={formData.age} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Cinsiyet</option>
            <option value="MALE">Erkek</option>
            <option value="FEMALE">Kadın</option>
          </select>
        </div>
        <div className="col-md-4">
          <select className="form-select" name="userType" value={formData.userType} onChange={handleChange}>
            <option value="CLIENT">Hasta</option>
            <option value="DIETITIAN">Diyetisyen</option>
          </select>
        </div>
        <div className="col-md-6 text-start">
          <button className="btn btn-outline-secondary mt-3" onClick={() => navigate("/admin-dashboard")}>
            ← Anasayfaya Dön
          </button>
        </div>
        <div className="col-md-6 text-end">
          <button className="btn btn-success mt-3" onClick={handleSubmit}>
            Ekle
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
