import express from "express";
import cors from "cors";
const port = 3000;
import cheerio from "cheerio";
import got from "got";

const app = express();
express.json({
  strict: false,
});
app.get("/", (req, res) => {
  res.json({
    message: "HelloWorld",
  });
});

app.get("/hello", async (req, res) => {
  const uri = "https://spankbang.com/s/Alison%20Tyler/?o=all";
  const body = await (await got(uri)).body;
  const $ = cheerio.load(body).html();
  console.log($);
  return res.send({ content: "Done" });
});

app.listen(port, () => console.log("Hello the port is now live."));
