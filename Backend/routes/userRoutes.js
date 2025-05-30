const { Router } = require("express");
const { IbuController } = require("../controllers/ibuController");
const { BidanController } = require("../controllers/bidanController");
const { authMiddleware } = require('../middlewares/authMiddleware.js');


class UserRoute {
    constructor() {
        this.router = Router();
        this.ibuController = new IbuController();
        this.bidanController = new BidanController();
    }

    getRoutes() {
        return this.router
            .post("/ibu", this.ibuController.createNewIbu)
            .post("/bidan", this.bidanController.createNewBidan)
            .post("/login/bidan", this.bidanController.loginBidan)
            .post("/login/ibu", this.ibuController.loginIbu)
            .post("/bidan/verifikasi", this.bidanController.verifyEmail)
            .post("/ibu/verifikasi", this.ibuController.verifyEmail)
            .post("/login/ibu", this.ibuController.loginIbu)
            .get("/bidan/:namaBidan/ibu", authMiddleware, this.bidanController.viewAllIbu)
            .get("/ibu/:id", authMiddleware, this.ibuController.getIbuById)
    }
}

module.exports = { UserRoute };
