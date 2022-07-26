const passwordSchema = require("../models/password");

module.exports = (req, res, next) => {
    if (passwordSchema.validate(req.body.password)) {
        next();
    } else {
        res.status(400).json({ message: "Le mots de passe est faible" });
    }
};
