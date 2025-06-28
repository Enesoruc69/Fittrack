import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

export default function DietitianRequestPage() {
  const [motivation, setMotivation] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [existingDocumentPath, setExistingDocumentPath] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null); // 'PENDING', 'REJECTED', 'APPROVED' veya null
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequestStatus = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        // Başvuru var mı diye kontrol et
        const checkRes = await axios.get(
          "http://localhost:8080/api/clients/dietitian-request/check",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (checkRes.data === true) {
          // Başvuru var, detayları getir
          const detailsRes = await axios.get(
            "http://localhost:8080/api/clients/dietitian-request/details",
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const statusFromDetails = detailsRes.data.status; 
          setRequestStatus(statusFromDetails);

          setMotivation(detailsRes.data.motivation || "");
          setExistingDocumentPath(detailsRes.data.documentPath || null);
        } else {
          // Başvuru yok, temizle
          setRequestStatus(null);
          setMotivation("");
          setExistingDocumentPath(null);
        }
      } catch (error) {
        console.error("Başvuru durumu kontrol edilirken hata oluştu:", error);
      }
    };

    fetchRequestStatus();
  }, []);

  const handleFileChange = (e) => {
    if (requestStatus === "PENDING") return; // Bekleyen başvuru varsa dosya değişimine izin verme
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!motivation.trim()) {
      toast.error("Lütfen motivasyon metnini giriniz.");
      return;
    }

    if (requestStatus !== "PENDING" && !documentFile) {
      toast.error("Lütfen diyetisyen belgesi yükleyiniz.");
      return;
    }

    const formData = new FormData();
    formData.append("motivation", motivation);

    if (documentFile) {
      formData.append("document", documentFile);
    }

    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post("http://localhost:8080/api/clients/dietitian-request", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Başvurunuz başarıyla gönderildi!");
      setRequestStatus("PENDING");
      setDocumentFile(null);
      setExistingDocumentPath(null);
      setMotivation("");
      setTimeout(() => navigate("/client-dashboard"), 1500);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data || "Başvuru gönderilirken bir hata oluştu.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4">📄 Diyetisyen Olma Başvurusu</h2>

      {requestStatus === "PENDING" && (
        <div className="alert alert-warning">
          ⚠️ Bekleyen bir başvurunuz mevcut. Yeni başvuru yapamazsınız.
        </div>
      )}

      {requestStatus === "REJECTED" && (
        <div className="alert alert-danger">
          ❌ Başvurunuz reddedildi. Tekrar başvuru yapmak ister misiniz?
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Motivasyon Metni</label>
          <textarea
            className="form-control"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="Neden diyetisyen olmak istiyorsunuz?"
            rows="4"
            required
            disabled={requestStatus === "PENDING"}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Diyetisyen Belgesi (PDF/JPG vs.)</label>

          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={requestStatus === "PENDING"}
            required={requestStatus !== "PENDING"}
          />

          {existingDocumentPath && (
            <div className="mt-2">
              <small>Yüklenen Dosya: </small>
              <a
                href={`http://localhost:8080${existingDocumentPath}`}
                target="_blank"
                rel="noreferrer"
              >
                Dosyayı Görüntüle
              </a>
            </div>
          )}

          {documentFile && requestStatus !== "PENDING" && (
            <div className="mt-2">
              <small>Seçilen Dosya: {documentFile.name}</small>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-success" disabled={requestStatus === "PENDING"}>
          Başvuruyu Gönder
        </button>
      </form>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
