import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

export default function HealthInfoPage() {
  const [healthInfo, setHealthInfo] = useState({
    bloodPressure: "",
    bloodSugar: "",
    cholesterol: "",
    allergies: "",
    medications: "",
    otherHealthConditions: "",
    height: "",
    weight: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchHealthInfo();
  }, []);

  const fetchHealthInfo = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(
        "http://localhost:8080/api/clients/health-info",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        const data =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;

        setHealthInfo({
          bloodPressure: data.bloodPressure || "",
          bloodSugar: data.bloodSugar || "",
          cholesterol: data.cholesterol || "",
          allergies: data.allergies || "",
          medications: data.medications || "",
          otherHealthConditions: data.otherHealthConditions || "",
          height: data.height || "",
          weight: data.weight || "",
        });
      }
    } catch (error) {
      toast.error("❌ Sağlık bilgileri yüklenemedi.");
    }
  };

  const handleChange = (e) => {
    setHealthInfo({ ...healthInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post(
        "http://localhost:8080/api/clients/health-info",
        healthInfo,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("✅ Sağlık bilgileri başarıyla kaydedildi!");
    } catch (error) {
      toast.error("❌ Kaydederken bir hata oluştu.");
    }
  };

  const fields = [
    ["Kan Basıncı", "bloodPressure", "text", true],
    ["Kan Şekeri", "bloodSugar", "text", true],
    ["Kolesterol", "cholesterol", "text", true],
    ["Alerjiler", "allergies", "text", true],
    ["İlaçlar", "medications", "text", true],
    ["Diğer Durumlar", "otherHealthConditions", "text", false],
    ["Boy (cm)", "height", "number", true],
    ["Kilo (kg)", "weight", "number", true],
  ];

  return (
    <div className="container mt-5 pb-5">
      <h2 className="mb-4">🩺 Sağlık Bilgilerim</h2>

      <form onSubmit={handleSubmit}>
        {fields.map(([label, name, type, required]) => (
          <div key={name} className="mb-3">
            <label className="form-label">{label}</label>
            <input
              type={type}
              className="form-control"
              name={name}
              value={healthInfo[name]}
              onChange={handleChange}
              required={required}
              min={type === "number" ? "0" : undefined}
              step={type === "number" ? "any" : undefined}
            />
          </div>
        ))}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <button type="submit" className="btn btn-success">
            Kaydet
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => navigate("/client-dashboard")}
          >
            Anasayfaya Dön
          </button>
        </div>
      </form>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}
