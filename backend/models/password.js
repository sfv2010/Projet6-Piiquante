const passwordValidator = require("password-validator");

// Creation du schéma
const passwordSchema = new passwordValidator();

passwordSchema
    .is()
    .min(5) // Minimum length 5
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase() // Doit avoir uppercase letters
    .has()
    .lowercase() // Doit avoir lowercase letters
    .has()
    .digits(2) // Doit avoir au moins 2 chiffres
    .has()
    .not()
    .spaces() // Ne doit pas avoir d'espaces
    .is()
    .not()
    .oneOf(["Passw0rd", "Password123"]);

module.exports = passwordSchema;
