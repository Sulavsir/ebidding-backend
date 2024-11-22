const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const MONGO_DB_URL = process.env.MONGO_DB_URL
const SMTP_EMAIL = process.env.SMTP_EMAIL
const SMTP_PWD = process.env.SMTP_PWD


module.exports = {
  JWT_SECRET_KEY,
  MONGO_DB_URL,
  SMTP_EMAIL,
  SMTP_PWD
};
