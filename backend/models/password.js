const passwordValidator = require("password-validator");

// Creation du schéma
const passwordSchema = new passwordValidator();

passwordSchema
    .is()
    .min(5) // Minimum length 5
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits(2) // Must have at least 2 digits
    .has()
    .not()
    .spaces() // Should not have spaces
    .is()
    .not()
    .oneOf(["Passw0rd", "Password123"]);

//---Exportation (vers middleware)---
module.exports = passwordSchema;
