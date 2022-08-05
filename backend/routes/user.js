//---Configuration les routes d'authentification---

//---Importation---
const express = require("express");
const router = express.Router(); //methode express.Router()
const userCtrl = require("../controllers/user");
const password = require("../middleware/password");

//---L’express-rate-limit est le package npm pour limiter la demande de l’utilisateur---
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 2, // limiter même IP du 2 requests par windowMs
    message: "Trop de requêtes de cette IP",
});

//---Router---
router.post("/signup", password, userCtrl.signup);
router.post("/login", limiter, userCtrl.login);

//---Exportation---
module.exports = router;
