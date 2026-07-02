require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("================================");
  console.log("🚀 Auth Backend Started");
  console.log("PORT:", PORT);
  console.log("NODE_ENV:", process.env.NODE_ENV || "development");
  console.log("================================");
});