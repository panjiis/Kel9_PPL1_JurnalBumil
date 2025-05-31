import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BacaLaporan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const idIbu = queryParams.get("id_ibu");
  const tanggal = queryParams.get("tanggal");

  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchLaporan = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/histori/laporan/baca?id_ibu=${idIbu}&tanggal=${tanggal}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Gagal mengambil data laporan.");
        const data = await res.json();
        setLaporan(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (idIbu && tanggal) {
      fetchLaporan();
    } else {
      setError("ID Ibu dan tanggal tidak ditemukan di URL.");
      setLoading(false);
    }
  }, [idIbu, tanggal]);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Memuat data...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 min-h-screen p-6 overflow-x-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow space-y-6">
          <h1 className="text-xl md:text-2xl font-bold text-center">Catatan Laporan Kunjungan</h1>
          <p className="text-center text-blue-600">{laporan.data.tanggal}</p>

          {/* Info Ibu */}
          <div className="text-left grid grid-cols-[max-content_1fr] gap-x-2 gap-y-2 text-sm md:text-base">
            <div className="text-blue-800 font-semibold">Nama Ibu</div>
            <div>: <span className="font-normal text-black">{laporan.data.nama_ibu}</span></div>
            <div className="text-blue-800 font-semibold">Usia Kehamilan</div>
            <div>: <span className="font-normal text-black">{laporan.data.usia_kehamilan} Minggu</span></div>
          </div>

          {/* Fisik Ibu */}
          <Section title="Fisik Ibu">
            <Field label="Berat badan" value={`${laporan.data.berat_badan} kg`} />
            <Field label="Tinggi badan" value={`${laporan.data.tinggi_badan} cm`} />
            <Field label="Lingkar lengan atas" value={`${laporan.data.lingkar_lengan} cm`} />
          </Section>

          {/* Kondisi Janin */}
          <Section title="Kondisi Janin">
            <Field label="Tinggi rahim" value={`${laporan.data.tinggi_rahim} cm`} />
            <Field label="Letak janin" value={laporan.data.posisi_janin} />
            <Field label="Denyut jantung janin" value={`${laporan.data.denyut_nadi_janin} bpm`} />
          </Section>

          {/* Kondisi Ibu */}
          <Section title="Kondisi Ibu">
            <Field label="Tekanan darah" value={`${laporan.data.tekanan_darah} mmHg`} />
            <Field label="Tablet tambah darah" value={`${laporan.data.tablet_tambah_darah}`} />
            <Field label="Tes hemoglobin" value={`${laporan.data.tes_hemoglobin} g/dL`} />
            <Field label="Golongan darah" value={laporan.data.golongan_darah} />
            <Field label="Gula darah" value={`${laporan.data.gula_darah} mg/dL`} />
          </Section>

          {/* Penyakit */}
          <Section title="Penyakit">
            <Field label="Imunisasi tetanus" value={laporan.data.imunisasi_tetanus} />
            <Field label="HIV" value={laporan.data.hiv ? "Positif" : "Negatif"} />
            <Field label="Sifilis" value={laporan.data.sifilis ? "Positif" : "Negatif"} />
            <Field label="Hepatitis" value={laporan.data.hepatitis ? "Positif" : "Negatif"} />
          </Section>

          {/* Skrining Bidan */}
          <Section title="Skrining Bidan">
            <p className="text-sm md:text-base">{laporan.data.hasil_skrining}</p>
          </Section>

          {/* Tombol Kembali */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition"
            >
              Kembali
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

// Komponen pembantu
const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h2 className="text-lg md:text-xl font-semibold mb-1 text-left">{title}:</h2>
    <div className="border border-blue-400 rounded-lg p-4 text-left space-y-1">
      {children}
    </div>
  </div>
);

// Komponen Field (rapih pakai grid)
const Field = ({ label, value }) => (
  <div className="flex text-sm md:text-base items-center">
    <div className="font-medium text-blue-800 min-w-[150px] md:min-w-[240px] truncate">{label}</div>
    <div className="mx-1">:</div>
    <div>{value}</div>
  </div>
);

export default BacaLaporan;
