import express from "express";
import cors from "cors";
const port = 3000;

const app = express();
express.json({
  strict: false,
});
app.get("/", (req, res) => {
  res.json({
    message: "HelloWorld",
  });
});

app.get("/hello", (req, res) => {
  return res.send({
    content: "heheh",
  });
});

app.listen(port, () => console.log("Hello the port is now live."));
