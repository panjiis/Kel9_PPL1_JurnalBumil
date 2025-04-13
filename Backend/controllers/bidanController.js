const { IbuService } = require("../services/ibuService");
const { BidanService } = require("../services/bidanService");
const { auth } = require("firebase-admin");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
require("dotenv").config();

const db = admin.firestore(); // Pastikan ini ada!

class BidanController {
    constructor() {
        this.bidanService = new BidanService();
        this.ibuService = new IbuService();
    }

    createNewBidan = async (req, res) => {
        try {
            const { nama_bidan, email_bidan, sandi_bidan, kode_lembaga, kode_bidan } = req.body;

            if (!nama_bidan || !email_bidan || !sandi_bidan || !kode_lembaga || !kode_bidan) {
                return res.status(400).json({ message: "Semua field wajib diisi" });
            }

            const emailInUseBidan = await this.bidanService.findByEmail(email_bidan);
            const emailInUseIbu = await this.ibuService.findByEmail(email_bidan);

            if (emailInUseBidan || emailInUseIbu) {
                return res.status(403).json({ message: "Email sudah digunakan" });
            }

            await auth().createUser({
                email: email_bidan,
                password: sandi_bidan,
                displayName: nama_bidan,
                emailVerified: false,
            });

            const verificationLink = await auth().generateEmailVerificationLink(email_bidan);

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_SENDER,
                    pass: process.env.EMAIL_PASSWORD,
                },
                debug: true,
            });

            const mailOptions = {
                from: process.env.EMAIL_SENDER,
                to: email_bidan,
                subject: 'Verifikasi Email Anda',
                html: `<p>Halo ${nama_bidan},</p>
                       <p>Silakan klik link berikut untuk memverifikasi email Anda:</p>
                       <a href="${verificationLink}">${verificationLink}</a>`
            };

            await transporter.sendMail(mailOptions);

            await this.bidanService.createBidan({
                nama_bidan,
                email_bidan,
                sandi_bidan,
                kode_lembaga,
                kode_bidan,
                verifikasi: 0,
                verifikasi_email: 0
            });

            res.status(201).json({
                email: email_bidan,
                message: "Email verifikasi telah dikirim",
                verificationLink
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    };

    verifyEmail = async (req, res) => {
        try {
            const { oobCode, email } = req.body;

            if (!oobCode || !email) {
                return res.status(400).json({ message: "Kode verifikasi atau email tidak ditemukan" });
            }

            // Terapkan verifikasi email menggunakan kode
            await auth().applyActionCode(oobCode);

            // Cari data bidan berdasarkan email
            const bidanSnapshot = await db.collection("Bidan").where("email_bidan", "==", email).get();

            if (bidanSnapshot.empty) {
                console.log("Pengguna tidak ditemukan di database dengan email:", email);
                return res.status(404).json({ message: "Pengguna tidak ditemukan" });
            }

            const bidanDoc = bidanSnapshot.docs[0];
            const verifikasiStatus = bidanDoc.data().verifikasi_email;

            if (verifikasiStatus === 2) {
                return res.status(200).json({ message: "Email sudah diverifikasi sebelumnya." });
            }

            await bidanDoc.ref.update({ verifikasi_email: 2 });

            res.status(200).json({ message: "Email berhasil diverifikasi!" });
        } catch (error) {
            console.error("Verifikasi gagal:", error);
            res.status(500).json({ message: "Verifikasi gagal: " + error.message });
        }
    };

    loginBidan = async (req, res) => {
        try{
            const { email_bidan, sandi_bidan } = req.body;

            if(!email_bidan || !sandi_bidan) {
                return res.status(403).json({ message: "email dan sandi tidak boleh kosong!" });
            }

            const emailExistsInBidan = await this.bidanService.findByEmail(email_bidan);    
            
            if (!emailExistsInBidan) {
                return res.status(403).json({ message: "Email tidak terdaftar" });
            }
    
            const authToken = await this.bidanService.loginBidan({
                email_bidan,
                sandi_bidan
            });

            res.cookie('authToken', authToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000, 
            });
        
    
            res.status(200).json({ message: "login sukses", authToken: authToken });
        }catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
}

module.exports = { BidanController };

