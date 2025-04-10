const { IbuService } = require("../services/ibuService");
const { BidanService } = require("../services/bidanService");
const { auth } = require("firebase-admin");

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

            const fields = { nama_bidan, email_bidan, sandi_bidan, kode_lembaga, kode_bidan };
            for (const [key, value] of Object.entries(fields)) {
                if (value.toString().trim() === "") {
                    return res.status(400).json({ message: `${key} tidak boleh kosong` });
                }
            }

            const emailExistsInBidan = await this.bidanService.findByEmail(email_bidan);
            const emailExistsInIbu = await this.ibuService.findByEmail(email_bidan);
    
            if (emailExistsInBidan || emailExistsInIbu) {
                return res.status(403).json({ message: "Email sudah digunakan" });
            }
    
            const newBidan = await this.bidanService.createBidan({
                nama_bidan,
                email_bidan,
                sandi_bidan,
                kode_lembaga,
                kode_bidan,
                verifikasi: 0
            });
    
            res.status(201).json({ bidanId: newBidan.id });
        } catch (error) {
            res.status(500).json({ message: error.message });
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