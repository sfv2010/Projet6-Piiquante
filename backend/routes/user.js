//Configuration les routes d'authentification

const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit"); //L’ express-rate-limit est le package npm pour limiter la demande de l’utilisateur.
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 2, // limiter même IP du 2 requests par windowMs
    message: "Trop de requêtes de cette IP",
});

const userCtrl = require("../controllers/user");
const password = require("../middleware/password");

router.post("/signup", password, userCtrl.signup);
router.post("/login", limiter, userCtrl.login);

module.exports = router;
