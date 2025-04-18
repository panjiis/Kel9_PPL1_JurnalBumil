const bcrypt = require("bcrypt");
const { db } = require("../firebaseClient");
const jwt = require('jsonwebtoken');

class IbuService {
    async createIbu(ibu) {
        const hashedPassword = await bcrypt.hash(ibu.sandi_ibu, 10);
        const newIbu = {
            nama_ibu: ibu.nama_ibu,
            email_ibu: ibu.email_ibu,
            sandi_ibu: hashedPassword,
            usia_kehamilan: ibu.usia_kehamilan,
            bidan: ibu.bidan || null,
            tanggal_registrasi: new Date(),
            verifikasi_email: 0 // Belum diverifikasi
        };

        const emailExistsInIbu = await db.collection("Ibu").where("email_ibu", "==", ibu.email_ibu).get();
        const emailExistsInBidan = await db.collection("Bidan").where("email_bidan", "==", ibu.email_ibu).get();

        if (!emailExistsInIbu.empty || !emailExistsInBidan.empty) {
            throw new Error("Email sudah digunakan");
        }

        const ibuRef = await db.collection("Ibu").add(newIbu);
        return { id: ibuRef.id, ...newIbu };
    }

    async findByEmail(email) {
        const ibuSnapshot = await db.collection("Ibu").where("email_ibu", "==", email).get();
        return !ibuSnapshot.empty;
    }


    async getAllIbuByKodeBidan(kode_bidan) {
        const ibuSnapshot = await db.collection("Ibu").where("kode_bidan", "==", kode_bidan).select("nama_ibu", "usia_kehamilan").get();

        if (ibuSnapshot.empty) {
            console.log('No matching documents.');
            return;
        }

        const docs = ibuSnapshot.docs;

        const dataIbu = docs.map(doc => {
            return {
                id: doc.id, ...doc.data()
            };
        });


        return dataIbu;
    }

    async getAllIbuWithCatatanByNamaBidan(nama_bidan) {
        try {
            const ibuSnapshot = await db
                .collection("Ibu")
                .where("bidan", "==", nama_bidan)
                .select("nama_ibu", "email_ibu", "usia_kehamilan", "tanggal_registrasi", "verifikasi_email")
                .get();

            if (ibuSnapshot.empty) {
                return [];
            }

            const ibuDataWithCatatan = await Promise.all(
                ibuSnapshot.docs.map(async (ibuDoc) => {
                    const ibuData = ibuDoc.data();
                    const id_ibu = ibuDoc.id;

                    // gunakan pendekatan seperti di getAllCatatanByIdIbu
                    const catatanSnapshot = await db
                        .collection("Catatan")
                        .where("id_ibu", "==", id_ibu)
                        .get();

                    const catatanList = catatanSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    return {
                        id: id_ibu,
                        ...ibuData,
                        catatan: catatanList
                    };
                })
            );

            return ibuDataWithCatatan;
        } catch (error) {
            console.error("Gagal mengambil data ibu & catatan:", error);
            throw new Error("Terjadi kesalahan saat mengambil data");
        }
    }




    async loginIbu(loginData) {
        const emailExistsInIbu = await db.collection("Ibu").where("email_ibu", "==", loginData.email_ibu).get();

        if (emailExistsInIbu.empty) {
            throw new Error("User belum terdaftar!");
        }

        console.log(emailExistsInIbu)

        const userData = emailExistsInIbu.docs[0].data();

        const isMatch = await bcrypt.compare(loginData.sandi_ibu, userData.sandi_ibu);

        if (isMatch) {
            //cek verifikasi_email = 2
            if (userData.verifikasi_email !== 2) {
                throw new Error("Akun belum diverifikasi!");
            }
            const authToken = this.generateAuthToken(userData);
            return authToken;
        } else {
            throw new Error("Invalid credentials");
        }

    }

    generateAuthToken(userData) {
        const payload = {
            userId: userData._id || userData.id,
            email: userData.email_ibu,
            nama: userData.nama_ibu,
            role: "ibu",

        }

        const secretKey = process.env.JWT_SECRET;

        const options = {
            expiresIn: '1h',
        };

        return jwt.sign(payload, secretKey, options);
    }
}

module.exports = { IbuService };