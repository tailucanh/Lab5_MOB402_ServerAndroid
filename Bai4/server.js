const express = require("express");
const app = express();
const port = 8000;
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
var dir = "D:/Android/AndroidPoly/MOB402_Android_Server/Lab5/Bai4/uploads";
const strErrLimit = "File đã vượt quá dung lượng cho phép.";
const strErrNull = "Chưa có file được tải lên.";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
app.use(bodyParser.urlencoded({ extended: true }));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    let fileName = file.originalname;
    arr = fileName.split(".");
    let newFileName = "";
    for (let i = 0; i < arr.length; i++) {
      if (i != arr.length - 1) {
        newFileName += arr[i] + ".";
      } else {
        newFileName += "-" + Date.now() + "." + arr[i];
      }
    }

    cb(null, newFileName);
  },
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 },
}).single("myFile");

app.post("/uploadFile", function (req, res) {
  upload(req, res, function (err) {
    const file = req.file;
    if (err instanceof multer.MulterError) {
      res.status(400).send({ error: strErrLimit });
    } else if (!file) {
      res.status(400).send({ error: strErrNull });
    } else {
      res.send(file);
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
