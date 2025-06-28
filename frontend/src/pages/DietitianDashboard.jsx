import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { FaUsers, FaClipboardList } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import DietitianMessages from "./DietitianMessages";
import DietitianProfile from "./DietitianProfile";
import { FaUserMd } from "react-icons/fa";
import DietitianNotes from './DietitianNotes';


export default function DietitianDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("patients");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [patients, setPatients] = useState([]);
  const [dietLists, setDietLists] = useState([]);
  const [expandedPatientIndex, setExpandedPatientIndex] = useState(null);
  const [dietInputs, setDietInputs] = useState({ breakfast: "", lunch: "", dinner: "", description: "" });
  const [currentDietPage, setCurrentDietPage] = useState(0);
  const itemsPerDietPage = 4; 


  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState([]);

  const navigate = useNavigate();
  const [currentTrackingPage, setCurrentTrackingPage] = useState(0);
  const itemsPerPage = 1;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      toast.error("Giriş yapmanız gerekiyor!");
      navigate("/login");
      return;
    }

    fetchPatients(token);
    fetchDietLists(token);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    toast.success("Başarıyla çıkış yapıldı!", { position: "top-center", autoClose: 1000 });
    setTimeout(() => navigate("/login"), 1000);
  };

  const fetchPatients = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/api/dietitians/my-patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Patients:", response.data); 
      patients.forEach(p => console.log(`Hasta: ${p.firstName} ${p.lastName} - ID: ${p.id}`));

      setPatients(response.data);
    } catch (error) {
      console.error("Hastalar alınamadı:", error);
      toast.error("Hastalar alınamadı.");
    }
  };


  const fetchDietLists = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/api/dietitians/my-diet-lists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDietLists(response.data);
    } catch (error) {
      console.error("Diyet listeleri alınamadı:", error);
      toast.error("Diyet listeleri alınamadı.");
    }
  };

  const handlePatientClick = async (patientId, index) => {
    console.log("Tıklanan Hasta ID:", patientId);
    if (!patientId) {
      toast.error("Hasta ID geçersiz!");
      return;
    }

    setExpandedPatientIndex(expandedPatientIndex === index ? null : index);
    setSelectedPatientId(patientId);

    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(`http://localhost:8080/api/tracking/client/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Tracking Info:", response.data);
      setTrackingInfo(response.data);


    } catch (error) {
      console.error("Takip bilgisi alınamadı:", error);
      toast.error("Takip bilgisi alınamadı.");
    }
  };

  const handleDietInputChange = (e) => {
    setDietInputs({ ...dietInputs, [e.target.name]: e.target.value });
  };

  const handleSaveDiet = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post(
        "http://localhost:8080/api/diet-lists/write",
        {
          clientId: selectedPatientId,
          name: "Özel Diyet Planı",
          description: dietInputs.description,
          morningMenu: dietInputs.breakfast,
          lunchMenu: dietInputs.lunch,
          dinnerMenu: dietInputs.dinner,

          forbiddens: "",
          duration: 30,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Diyet başarıyla kaydedildi!");
      setDietInputs({ breakfast: "", lunch: "", dinner: "", description: "" });
      handlePatientClick(selectedPatientId, expandedPatientIndex);
      fetchDietLists(token); // Diyet listesi güncellemesi yap
    } catch (error) {
      console.error("Diyet kaydedilemedi:", error);
      toast.error("Diyet kaydedilemedi.");
    }
  };

  const isMobile = windowWidth < 768;
  const primaryColor = "#f0fdf4";
  const green = "#3CB371";
  const paginatedTracking = trackingInfo.slice(
    currentTrackingPage * itemsPerPage,
    (currentTrackingPage + 1) * itemsPerPage
  );
  return (
    <>

      <div className="min-vh-100 d-flex" style={{ backgroundColor: primaryColor }}>
        {(!isMobile || menuOpen) && (
          <div
            className="position-fixed top-0 start-0 h-100 p-3 border-end"
            style={{ width: "250px", zIndex: 1000, backgroundColor: isMobile ? "white" : green }}
          >
            <div className="border-bottom mb-4 pb-2">
              <h2 className={isMobile ? "text-success" : "text-white"}>Diyetisyen Paneli</h2>
            </div>
            <nav className="nav flex-column">
              <button
                className={`nav-link text-start ${activePage === "patients" ? "fw-bold" : ""} ${isMobile ? "text-dark" : "text-light"
                  }`}
                onClick={() => {
                  setActivePage("patients");
                  setMenuOpen(false);
                }}
              >
                <FaUsers className="me-2" /> Hastalarım
              </button>
              <button
                className={`nav-link text-start ${activePage === "lists" ? "fw-bold" : ""} ${isMobile ? "text-dark" : "text-light"
                  }`}
                onClick={() => {
                  setActivePage("lists");
                  setMenuOpen(false);
                }}
              >
                <FaClipboardList className="me-2" /> Diyet Listeleri
              </button>
              <button
                className={`nav-link text-start ${activePage === "messages" ? "fw-bold" : ""} ${isMobile ? "text-dark" : "text-light"
                  }`}
                onClick={() => {
                  setActivePage("messages");
                  setMenuOpen(false);
                }}
              >
                📩 Mesajlar
              </button>
<button
  className={`nav-link text-start ${activePage === "notes" ? "fw-bold" : ""} ${isMobile ? "text-dark" : "text-light"}`}
  onClick={() => {
    setActivePage("notes");
    setMenuOpen(false);
  }}
>
  📒 Notlar
</button>

              <button
  className={`nav-link text-start ${activePage === "dietitianProfile" ? "fw-bold" : ""} ${isMobile ? "text-dark" : "text-light"}`}
  onClick={() => {
    setActivePage("dietitianProfile");
    setMenuOpen(false);
  }}
>
  <FaUserMd className="me-2" /> Diyetisyen Profilim
</button>


            </nav>
          </div>
        )}

        <div className="flex-grow-1" style={{ marginLeft: !isMobile ? 250 : 0 }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ backgroundColor: primaryColor }}>
            {isMobile && (
              <button className="btn btn-outline-dark" onClick={() => setMenuOpen(!menuOpen)}>
                <GiHamburgerMenu />
              </button>
            )}
            <h1 className="h5 mb-0">
              {activePage === "patients" && "Hastalarım"}
              {activePage === "lists" && "Diyet Listeleri"}
{activePage === "dietitianProfile" && <DietitianProfile />}
              {activePage === "messages" && (
                <DietitianMessages />
              )}
              {activePage === "notes" && <DietitianNotes selectedClient={selectedPatientId} />}


            </h1>
            <div className="d-flex align-items-center gap-3">
              <button onClick={handleLogout} className="btn btn-sm btn-danger fw-bold">
                Çıkış Yap
              </button>
              <div
                className="bg-white text-success fw-bold rounded-circle d-flex align-items-center justify-content-center border"
                style={{ width: "40px", height: "40px" }}
              >
                D
              </div>
            </div>
          </div>

          <div className="p-4">
            {activePage === "patients" && (
              <div>
                <h5 className="mb-4">📋 Kayıtlı Hastalar</h5>
                <div className="row g-3">
                  {patients.map((p, i) => (
                    <div className="col-md-6" key={i}>
                      <div className="card border-success shadow-sm">
                        <div className="card-body">
                          <h5
                            className="card-title text-success"
                            style={{ cursor: "pointer" }}
                            onClick={() => handlePatientClick(p.id, i)}
                          >
                            {p.firstName} {p.lastName}
                          </h5>
                          <p><strong>Email:</strong> {p.email}</p>
                          <p><strong>Yaş:</strong> {p.age}</p>

                          {expandedPatientIndex === i && (
                            <div className="mt-3">
                              <h6>📊 Kan ve Sağlık Değerleri</h6>
                              {trackingInfo.length > 0 ? (
                                <>
                                  {paginatedTracking.map((t, idx) => (
                                    <div key={idx} className="mb-2 p-2 border rounded">
                                      <p><strong>Tarih:</strong> {new Date(t.createdAt).toLocaleDateString()}</p>
                                      <p><strong>Tansiyon:</strong> {t.bloodPressure}</p>
                                      <p><strong>Kan Şekeri:</strong> {t.bloodSugar}</p>
                                      <p><strong>Kolesterol:</strong> {t.cholesterol}</p>
                                      <p><strong>Allerjiler:</strong> {t.allergies || "Belirtilmemiş"}</p>
                                      <p><strong>Kullandığı İlaçlar:</strong> {t.medications || "Belirtilmemiş"}</p>
                                      <p><strong>Diğer Sağlık Durumları:</strong> {t.otherHealthConditions || "Belirtilmemiş"}</p>
                                      <p><strong>Diyet Tipi:</strong> {t.dietTypeName}</p>
                                    </div>
                                  ))}

                                  {trackingInfo.length > 1 && (
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                      <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => setCurrentTrackingPage((prev) => Math.max(prev - 1, 0))}
                                        disabled={currentTrackingPage === 0}
                                      >
                                        ⬅️ Önceki
                                      </button>

                                      <span className="fw-bold">
                                        Sayfa {currentTrackingPage + 1} / {Math.ceil(trackingInfo.length / itemsPerPage)}
                                      </span>

                                      <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() =>
                                          setCurrentTrackingPage((prev) =>
                                            prev + 1 < Math.ceil(trackingInfo.length / itemsPerPage) ? prev + 1 : prev
                                          )
                                        }
                                        disabled={currentTrackingPage + 1 >= Math.ceil(trackingInfo.length / itemsPerPage)}
                                      >
                                        Sonraki ➡️
                                      </button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className="text-muted">Henüz takip bilgisi bulunmamaktadır.</p>
                              )}


                              <h6 className="mb-3 mt-4">📝 Diyet Planı Yaz</h6>
                              <textarea
                                name="description"
                                value={dietInputs.description}
                                onChange={handleDietInputChange}
                                className="form-control mb-2"
                                rows={2}
                                placeholder="Diyet Açıklaması"
                              />
                              <textarea
                                name="breakfast"
                                value={dietInputs.breakfast}
                                onChange={handleDietInputChange}
                                className="form-control mb-2"
                                rows={2}
                                placeholder="Kahvaltı Planı"
                              />
                              <textarea
                                name="lunch"
                                value={dietInputs.lunch}
                                onChange={handleDietInputChange}
                                className="form-control mb-2"
                                rows={2}
                                placeholder="Öğle Yemeği Planı"
                              />
                              <textarea
                                name="dinner"
                                value={dietInputs.dinner}
                                onChange={handleDietInputChange}
                                className="form-control mb-3"
                                rows={2}
                                placeholder="Akşam Yemeği Planı"
                              />
                              <button className="btn btn-success w-100 fw-bold" onClick={handleSaveDiet}>
                                💾 Diyeti Kaydet
                              </button>


                            </div>
                            
                            
                          )}

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

{activePage === "lists" && (
  <div>
    <h5 className="mb-4">🥗 Diyet Listelerim</h5>

    {dietLists.length > 0 ? (
      <>
        <div className="row g-3">
          {dietLists
            .slice(currentDietPage * itemsPerDietPage, (currentDietPage + 1) * itemsPerDietPage)
            .map((list, idx) => (
              <div key={idx} className="col-md-6">
                <div className="card border-primary shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title text-primary">{list.name}</h5>
                    <p><strong>Hasta:</strong> {list.clientName || "Bilinmiyor"}</p>
                    <p><strong>Açıklama:</strong> {list.description || "Yok"}</p>
                    <p><strong>Kahvaltı:</strong> {list.morningMenu}</p>
                    <p><strong>Öğle Yemeği:</strong> {list.lunchMenu}</p>
                    <p><strong>Akşam Yemeği:</strong> {list.dinnerMenu}</p>
                    <p><strong>Süre:</strong> {list.duration} gün</p>
                    <p><strong>Oluşturulma Tarihi:</strong> {new Date(list.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Sayfalama Kontrolleri */}
        {dietLists.length > itemsPerDietPage && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setCurrentDietPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentDietPage === 0}
            >
              ⬅️ Önceki
            </button>

            <span className="fw-bold">
              Sayfa {currentDietPage + 1} / {Math.ceil(dietLists.length / itemsPerDietPage)}
            </span>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() =>
                setCurrentDietPage((prev) =>
                  prev + 1 < Math.ceil(dietLists.length / itemsPerDietPage) ? prev + 1 : prev
                )
              }
              disabled={currentDietPage + 1 >= Math.ceil(dietLists.length / itemsPerDietPage)}
            >
              Sonraki ➡️
            </button>
          </div>
        )}
      </>
    ) : (
      <p className="text-muted">Henüz kayıtlı diyet listeniz bulunmamaktadır.</p>
    )}
  </div>
)}

          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
