const express = require("express");

const app = express();

app.use((req, res) => {
  res.send("Hello from server");
});

app.listen(3000, () => {
  console.log("Server is successfully listening on port 3000");
});
