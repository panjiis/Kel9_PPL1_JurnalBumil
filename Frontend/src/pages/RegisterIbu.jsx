import React, { useState } from "react";
import axios from "axios";
import FormLayout from "../components/FormLayout";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import SubmitButton from "../components/SubmitButton";
import SwitchAuthLink from "../components/SwitchAuthLink";
import { useNavigate } from "react-router-dom";


const Register = () => {
  const [form, setForm] = useState({
    nama_ibu: "",
    email_ibu: "",
    sandi_ibu: "",
    confirmPassword: "",
    usia_kehamilan: "",
    bidan: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  const namaRegex = /^[A-Za-z\s]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

  if (!namaRegex.test(form.nama_ibu)) {
    return setError("Nama hanya boleh berisi huruf dan spasi.");
  }

  if (form.sandi_ibu.length < 8) {
    return setError("Password harus minimal 8 karakter.");
  }

  if (!passwordRegex.test(form.sandi_ibu)) {
    return setError("Password harus mengandung huruf besar, huruf kecil, dan angka.");
  }

  if (form.sandi_ibu !== form.confirmPassword) {
    return setError("Konfirmasi password tidak cocok.");
  }

  const usia = Number(form.usia_kehamilan);
  if (usia < 0 || usia > 50) {
    return setError("Usia kehamilan harus antara 0 hingga 50 minggu.");
  }

  try {
    const { confirmPassword, ...restForm } = form;
    const postData = {
      ...restForm,
      usia_kehamilan: usia,
    };
    await axios.post("http://localhost:8000/api/ibu", postData);
    setSuccess("Registrasi berhasil!");
    setForm({
      nama_ibu: "",
      email_ibu: "",
      sandi_ibu: "",
      confirmPassword: "",
      usia_kehamilan: "",
      bidan: "",
    });
    navigate("/verifikasi");
  } catch (err) {
    const msg = err.response?.data?.message || "Terjadi kesalahan saat registrasi.";
    setError(msg);
  }
};


  return (
    <FormLayout
      title="Daftar"
      description="Daftarkan akun Anda untuk mengakses fitur"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Nama*"
          name="nama_ibu"
          type="text"
          placeholder="Masukkan Nama"
          required
          value={form.nama_ibu}
          onChange={handleChange}
        />
        <FormInput
          label="Email*"
          name="email_ibu"
          type="email"
          placeholder="Masukkan Email"
          required
          value={form.email_ibu}
          onChange={handleChange}
        />
        <PasswordInput
          label="Password*"
          name="sandi_ibu"
          value={form.sandi_ibu}
          onChange={handleChange}
          required
          minLength={8}
          placeholder="Buat kata sandi"
        />
        <PasswordInput
          label="Ulangi Password*"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          minLength={8}
          placeholder="Ulangi kata sandi"
        />
        <FormInput
          label="Usia Kehamilan (Minggu)"
          name="usia_kehamilan"
          type="number"
          placeholder="Contoh: 10"
          value={form.usia_kehamilan}
          onChange={handleChange}
        />
        <FormInput
          label="Bidan"
          name="bidan"
          type="text"
          placeholder="Nama Bidan"
          value={form.bidan}
          onChange={handleChange}
        />
        <SubmitButton>Buat akun</SubmitButton>
      </form>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      {success && <p className="text-green-500 text-sm mt-3">{success}</p>}

      <SwitchAuthLink
          question="Daftar sebagai bidan?"
          linkText="Klik di sini"
          to="/register/bidan"
      />

      <p className="text-sm text-center mt-6">
        Sudah memiliki akun?{" "}
        <a href="/login" className="text-blue-800 font-medium">Masuk</a>
      </p>
    </FormLayout>
  );
};

export default Register;
