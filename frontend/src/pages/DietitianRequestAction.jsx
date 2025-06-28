import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function DietitianRequestAction() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("jwtToken");

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Bekleyen istekleri getir
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8080/api/admin/dietitian-requests",
        axiosConfig
      );
      const pendingRequests = res.data.filter((req) => req.status === "PENDING");
      setRequests(pendingRequests);
    } catch (error) {
      console.error("Diyetisyen istekleri alınamadı:", error);
      toast.error("Diyetisyen istekleri alınamadı!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Belge indir
  const downloadDocument = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/admin/dietitian-requests/download/${id}`,
        {
          ...axiosConfig,
          responseType: "blob",
        }
      );

      const contentDisposition = res.headers["content-disposition"];
      let fileName = "document.pdf";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1]);
        }
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Belge indirme hatası:", error);
      toast.error("Belge indirilemedi!");
    }
  };

  // 
  const approveRequest = async (id) => {
    try {
      await axios.post(
        `http://localhost:8080/api/admin/dietitian-requests/${id}/approve`,
        null,
        axiosConfig
      );
      toast.success("Başvuru onaylandı, kullanıcı diyetisyen oldu.");
      
      fetchRequests();
      setTimeout(() => {
      window.location.reload();
    }, 1000);
    } catch (error) {
      console.error("Onay hatası:", error);
      toast.error("Başvuru onaylanamadı!");
    }
  };

  // Reddet
  const rejectRequest = async (id) => {
    try {
      await axios.post(
        `http://localhost:8080/api/admin/dietitian-requests/${id}/reject`,
        null,
        axiosConfig
      );
      toast.success("Başvuru reddedildi.");
      fetchRequests();
    } catch (error) {
      console.error("Red hatası:", error);
      toast.error("Başvuru reddedilemedi!");
    }
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (requests.length === 0) return <p>Bekleyen diyetisyen isteği yok.</p>;

  return (
    <div>
      <h4>Diyetisyen Olma İstekleri</h4>
      <ul className="list-group">
        {requests.map((req) => (
          <li key={req.id} className="list-group-item mb-3">
            <div>
              <strong>Başvuran:</strong> {req.clientFullName}
            </div>
            <div>
              <strong>Motivasyon Metni:</strong>
              <p>{req.motivationText}</p>
            </div>
            <div>
              <button
                className="btn btn-link p-0"
                onClick={() => downloadDocument(req.id)}
              >
                📄 Başvuru Belgesini İndir
              </button>
            </div>
            <div className="mt-2">
              <button
                className="btn btn-success me-2"
                onClick={() => approveRequest(req.id)}
              >
                Onayla
              </button>
              <button
                className="btn btn-danger"
                onClick={() => rejectRequest(req.id)}
              >
                Reddet
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
