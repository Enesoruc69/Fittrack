import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaClipboardList, FaHeartbeat } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import DietitianSelection from "../components/DietitianSelect";
import DietTypeSelect from "../components/DietTypeSelect";
import HealthInfoPage from "../pages/HealthInfoPage";
import ClientMessages from "./ClientMessages";
import DietitianRequestPage from "../pages/DietitianRequestPage";
import ClientProfile from "./ClientProfile";
import { FaUser } from "react-icons/fa";

export default function PatientDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [dietitians, setDietitians] = useState([]);
  const [myDietitian, setMyDietitian] = useState(null);
  const [healthInfo, setHealthInfo] = useState(null);
  const [dietList, setDietList] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [dietTypeName, setDietTypeName] = useState(null);
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiResult, setBmiResult] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([
    { name: "Elma (1 adet)", calories: 52 },
    { name: "Muz (1 adet)", calories: 89 },
    { name: "Portakal (1 adet)", calories: 62 },
    { name: "Üzüm (100g)", calories: 69 },
    { name: "Çilek (100g)", calories: 33 },
    { name: "Karpuz (100g)", calories: 30 },
    { name: "Pirinç (100g)", calories: 130 },
    { name: "Bulgur (100g)", calories: 120 },
    { name: "Makarna (haşlanmış, 100g)", calories: 131 },
    { name: "Patates (haşlanmış, 100g)", calories: 87 },
    { name: "Ekmek (1 dilim)", calories: 80 },
    { name: "Tam buğday ekmek (1 dilim)", calories: 69 },
    { name: "Tavuk Göğsü (100g)", calories: 165 },
    { name: "Kırmızı Et (100g)", calories: 250 },
    { name: "Balık (somon, 100g)", calories: 206 },
    { name: "Yumurta (1 adet)", calories: 68 },
    { name: "Yoğurt (1 kase)", calories: 95 },
    { name: "Süt (1 bardak)", calories: 103 },
    { name: "Ayran (1 bardak)", calories: 50 },
    { name: "Peynir (beyaz, 1 dilim)", calories: 85 },
    { name: "Zeytin (5 adet)", calories: 37 },
    { name: "Ceviz (2 adet)", calories: 90 },
    { name: "Fındık (10 adet)", calories: 70 },
    { name: "Fıstık Ezmesi (1 tatlı kaşığı)", calories: 94 },
    { name: "Cips (100g)", calories: 536 },
    { name: "Çikolata (1 kare)", calories: 55 },
    { name: "Kek (1 dilim)", calories: 250 },
    { name: "Kola (1 bardak)", calories: 97 },
    { name: "Meyve Suyu (1 bardak)", calories: 110 },
    { name: "Kahve (sade)", calories: 2 },
    { name: "Şeker (1 küp)", calories: 20 },
    { name: "Salatalık (100g)", calories: 16 },
    { name: "Domates (1 adet)", calories: 22 },
    { name: "Marul (100g)", calories: 15 },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();

  const isMobile = windowWidth < 768;
  const primaryColor = "#dff5e3";
  const darkPrimary = "#3CB371";
  const lightBackground = "#f8fdfb";

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    fetchMyProfile();
    fetchDietitians();
    fetchDietList();
    fetchHealthInfo();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchMyProfile = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return navigate("/login");

      const response = await axios.get("http://localhost:8080/api/clients/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      if (data.dietitianName) {
        setMyDietitian(data.dietitianName);
      } else {
        setMyDietitian(null);
      }

      setDietTypeName(data.dietTypeName || null);
    } catch (error) {
      toast.error("Profil bilgisi alınamadı.");
    }
  };

  const fetchHealthInfo = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(
        "http://localhost:8080/api/clients/health-info",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHealthInfo(response.data);
    } catch (error) {
      console.error("Sağlık bilgileri alınamadı.");
    }
  };

  const fetchDietitians = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get("http://localhost:8080/api/dietitians", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDietitians(response.data);
    } catch (error) {
      toast.error("Diyetisyen bilgisi alınamadı.");
    }
  };

  const fetchDietList = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(
        "http://localhost:8080/api/clients/diet-list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDietList(response.data);
    } catch (error) {
      console.log("Diyet listesi alınamadı.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    toast.success("Çıkış yapıldı!", { autoClose: 1000 });
    setTimeout(() => navigate("/login"), 1000);
  };

  const handleSelectDietitian = async (dietitianId) => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post(
        "http://localhost:8080/api/clients/select-dietitian",
        { dietitianId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const selected = dietitians.find((d) => d.id === dietitianId);
      if (selected)
        setMyDietitian(`${selected.firstName} ${selected.lastName}`);

      toast.success("Diyetisyen seçildi!");
    } catch (error) {
      toast.error("Önce Sağlık bilgileri ve diyet tipi seçin!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post(
        "http://localhost:8080/api/clients/health-info",
        healthInfo,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Sağlık bilgileri kaydedildi!");
    } catch (error) {
      toast.error("Sağlık bilgileri kaydedilemedi!");
    }
  };

  return (
    <>
      <div
        className="min-vh-100 d-flex"
        style={{ backgroundColor: lightBackground }}
      >
        {(!isMobile || menuOpen) && (
          <div
            className="position-fixed top-0 start-0 h-100 p-3 border-end"
            style={{
              width: "250px",
              zIndex: 1000,
              backgroundColor: isMobile ? "white" : darkPrimary,
            }}
          >
            <h2 className={isMobile ? "text-success" : "text-white"}>
              Hasta Paneli
            </h2>
            <nav className="nav flex-column mt-4">
              <button
                className={`nav-link text-start d-flex align-items-center gap-2 ${
                  activePage === "home" ? "fw-bold" : ""
                }`}
                onClick={() => {
                  setActivePage("home");
                  setMenuOpen(false);
                }}
              >
                <FaHome /> Ana Sayfa
              </button>

              <button
                className={`nav-link text-start d-flex align-items-center gap-2 ${
                  activePage === "health" ? "fw-bold" : ""
                }`}
                onClick={() => {
                  setActivePage("health");
                  setMenuOpen(false);
                }}
              >
                <FaHeartbeat /> Sağlık Bilgilerim
              </button>

              <button
                className={`nav-link text-start d-flex align-items-center gap-2 ${
                  activePage === "diet" ? "fw-bold" : ""
                }`}
                onClick={() => {
                  setActivePage("diet");
                  setMenuOpen(false);
                }}
              >
                <FaClipboardList /> Diyet Listem
              </button>

              <button
                className={`nav-link text-start d-flex align-items-center gap-2 ${
                  activePage === "messages" ? "fw-bold" : ""
                }`}
                onClick={() => {
                  setActivePage("messages");
                  setMenuOpen(false);
                }}
              >
                📩 Mesajlarım
              </button>

              <button
                className={`nav-link text-start d-flex align-items-center gap-2 ${
                  activePage === "bmi" ? "fw-bold" : ""
                }`}
                onClick={() => {
                  setActivePage("bmi");
                  setMenuOpen(false);
                }}
              >
                🧮 VKE Hesapla
              </button>

              <button
                className={`nav-link text-start d-flex align-items-center gap-2 ${
                  activePage === "calories" ? "fw-bold" : ""
                }`}
                onClick={() => {
                  setActivePage("calories");
                  setMenuOpen(false);
                }}
              >
                🍽️ Kalori Rehberi
              </button>

              <button
  className={`nav-link text-start d-flex align-items-center gap-2 ${
    activePage === "clientProfile" ? "fw-bold" : ""
  }`}
  onClick={() => {
    setActivePage("clientProfile");
    setMenuOpen(false);
  }}
>
  <FaUser /> Profil Bilgilerim
</button>



              <button
  className={`nav-link text-start d-flex align-items-center gap-2 ${
    activePage === "dietitianRequest" ? "fw-bold" : ""
  }`}
  onClick={() => {
    setActivePage("dietitianRequest");
    setMenuOpen(false);
  }}
>
  📄 Diyetisyen Başvurusu
</button>
            </nav>
          </div>
        )}

        <div
          className="flex-grow-1"
          style={{ marginLeft: !isMobile ? 250 : 0 }}
        >
          <div
            className="d-flex justify-content-between align-items-center p-3 border-bottom"
            style={{ backgroundColor: primaryColor }}
          >
            {isMobile && (
              <button
                className="btn btn-outline-dark"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <GiHamburgerMenu />
              </button>
            )}
            <h1 className="h5 mb-0">
  {activePage === "home"
    ? "Ana Sayfa"
    : activePage === "health"
    ? "Sağlık Bilgilerim"
    : activePage === "diet"
    ? "Diyet Listem"
    : activePage === "messages"
    ? "Mesajlarım"
    : activePage === "bmi"
    ? "Vücut Kitle Endeksi"
    : activePage === "dietitianRequest"
    ? "Diyetisyen Başvurusu"
    : activePage === "clientProfile"
    ? "Profil Bilgilerim"
    : "Kalori Rehberi"}
</h1>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-danger fw-bold"
            >
              Çıkış Yap
            </button>
          </div>

          <div className="p-4">
            {activePage === "home" && (
              <>
                <DietitianSelection
                  dietitians={dietitians}
                  handleSelectDietitian={handleSelectDietitian}
                  myDietitian={myDietitian}
                  healthInfo={healthInfo}
                  dietTypeName={dietTypeName}
                />
                <hr className="my-4" />
                <DietTypeSelect
                  dietTypeName={dietTypeName}
                  onDietTypeChange={(name) => setDietTypeName(name)}
                />
              </>
            )}

            {activePage === "health" && (
              <>
                <h3>🩺 Sağlık Bilgilerim</h3>
                <form onSubmit={handleSubmit}>
  {[
    ["Kan Basıncı", "bloodPressure"],
    ["Kan Şekeri", "bloodSugar"],
    ["Kolesterol", "cholesterol"],
    ["Alerjiler", "allergies"],
    ["İlaçlar", "medications"],
    ["Diğer Durumlar", "otherHealthConditions"],
    ["Boy (cm)", "height"],      
    ["Kilo (kg)", "weight"],      
  ].map(([label, name]) => (
    <div key={name} className="mb-3">
      <label className="form-label">{label}</label>
      <input
        type={name === "height" || name === "weight" ? "number" : "text"}
        className="form-control"
        name={name}
        value={healthInfo ? healthInfo[name] : ""}
        onChange={(e) =>
          setHealthInfo({
            ...healthInfo,
            [e.target.name]: e.target.value,
          })
        }
        required={name !== "otherHealthConditions"}
        min={name === "height" || name === "weight" ? "0" : undefined}
        step={name === "height" || name === "weight" ? "any" : undefined}
      />
    </div>
  ))}
  <button type="submit" className="btn btn-success">
    Kaydet
  </button>
</form>

              </>
            )}

          {activePage === "dietitianRequest" && <DietitianRequestPage />}

          {activePage === "clientProfile" && (
  <ClientProfile />
)}


            {activePage === "bmi" && (
              <div>
                <h3>🧮 Vücut Kitle Endeksi (BMI) Hesapla</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const heightM = bmiHeight / 100;
                    const bmi = bmiWeight / (heightM * heightM);
                    setBmiResult(bmi.toFixed(2));
                  }}
                >
                  <div className="mb-3">
                    <label className="form-label">Boy (cm)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={bmiHeight}
                      onChange={(e) => setBmiHeight(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Kilo (kg)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={bmiWeight}
                      onChange={(e) => setBmiWeight(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-success">
                    Hesapla
                  </button>
                </form>

                {bmiResult && (
                  <div className="mt-4">
                    <p>
                      Hesaplanan VKE: <strong>{bmiResult}</strong>
                    </p>
                    <p>
                      📌 Durum:{" "}
                      <strong>
                        {bmiResult < 18.5
                          ? "Zayıf"
                          : bmiResult < 25
                          ? "Normal"
                          : bmiResult < 30
                          ? "Fazla kilolu"
                          : "Obez"}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            {activePage === "calories" && (
              <div>
                <h3>🍽️ Kalori Rehberi</h3>

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <div className="list-group">
                  {products
                    .filter((item) =>
                      item.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((item, idx) => {
                      const count = selectedItems[item.name] || 0;

                      return (
                        <div
                          key={idx}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>{item.name}</strong>{" "}
                            <span className="text-muted">
                              ({item.calories} kcal)
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled={count === 0}
                              onClick={() => {
                                setSelectedItems((prev) => {
                                  const updated = { ...prev };
                                  if (updated[item.name] > 1) {
                                    updated[item.name] -= 1;
                                  } else {
                                    delete updated[item.name];
                                  }
                                  return updated;
                                });
                              }}
                            >
                              -
                            </button>
                            <span>{count}</span>
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                setSelectedItems((prev) => ({
                                  ...prev,
                                  [item.name]: (prev[item.name] || 0) + 1,
                                }))
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/*Sayfalama */}
                <div className="mt-3 d-flex justify-content-center gap-2">
                  {Array.from({
                    length: Math.ceil(
                      products.filter((item) =>
                        item.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      ).length / itemsPerPage
                    ),
                  }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`btn btn-sm ${
                        currentPage === index + 1
                          ? "btn-success"
                          : "btn-outline-secondary"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {/* Toplam Kalori ve Sıfırla */}
                <div className="mt-4">
                  <h5>
                    Toplam Kalori:{" "}
                    <strong>
                      {Object.entries(selectedItems).reduce(
                        (total, [name, count]) => {
                          const product = products.find((p) => p.name === name);
                          return (
                            total + (product ? product.calories * count : 0)
                          );
                        },
                        0
                      )}{" "}
                      kcal
                    </strong>
                  </h5>

                  <button
                    className="btn btn-outline-danger mt-3"
                    onClick={() => setSelectedItems({})}
                  >
                     Seçimi Sıfırla
                  </button>
                </div>
              </div>
            )}

            {activePage === "diet" &&
              (dietList ? (
                <div className="card shadow p-4">
                  <h4>{dietList.name}</h4>
                  <p className="mb-2">📄 Açıklama: {dietList.description}</p>
                  <p>🍳 Kahvaltı: {dietList.morningMenu}</p>
                  <p>🍛 Öğle: {dietList.lunchMenu}</p>
                  <p>🍽️ Akşam: {dietList.dinnerMenu}</p>
                  <p>⏱️ Süre: {dietList.duration} gün</p>
                  <p>🍽️ Diyet Tipi: {dietList.dietTypeName}</p>
                  <p className="text-muted mt-2">
                    🧑‍⚕️ Diyetisyen: {dietList.dietitianName}
                    <br />
                    👤 Danışan: {dietList.clientName}
                    <br />
                    📅 Oluşturulma:{" "}
                    {new Date(dietList.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-muted">
                  Henüz tanımlanmış bir diyet listeniz bulunmamaktadır.
                </p>
              ))}

            {activePage === "messages" && <ClientMessages />}
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
