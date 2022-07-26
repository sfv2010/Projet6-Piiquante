//Configuration les routes d'authentification

const express = require("express");
const router = express.Router();
//const password = require("../middleware/password");
const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
