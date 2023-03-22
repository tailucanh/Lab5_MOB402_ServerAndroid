const express = require("express");
const app = express();
const port = 3030;
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");

var dir = "D:/Android/AndroidPoly/MOB402_Android_Server/Lab5/Bai5/uploads";
const strErrNull = "Chưa có file được tải lên.";
const strErrJPEG = "Chỉ được tải lên ảnh có định dạng JPEG";
const strErrImage = "Chưa có file được tải lên hoặc file không phải là ảnh.";

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

var uploadMultiple = multer({ storage: storage });

//Uploading multiple files
app.post("/uploadMultiple", uploadMultiple.array("myFiles", 12), (req, res) => {
  const files = req.files;
  if (files.length == 0) {
    res.status(400).send({ error: strErrNull });
  }
  res.send(files);
});
//Uploading files image JPEG
const fileFilter = function (req, file, cb) {
  if (file.mimetype !== "image/jpeg") {
    req.fileValidationError = strErrJPEG;
    return cb(new Error(strErrJPEG), false);
  }
  cb(null, true);
};
var uploadOnlyJPEG = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("myFile");

app.post("/uploadOnlyJPEG", function (req, res) {
  uploadOnlyJPEG(req, res, function (err) {
    const file = req.file;
    if (req.fileValidationError) {
      res.status(400).send({ error: strErrJPEG });
    } else if (!file) {
      res.status(400).send({ error: strErrNull });
    } else {
      res.send(file);
    }
  });
});
//Upload a file that is another image in JPEG format, then that image changes to JPEG extension.
var uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(strErrImage));
    }
  },
}).single("myImage");

app.post("/uploadImage", function (req, res) {
  uploadImage(req, res, function (err) {
    const file = req.file;
    if (!file) {
      res.status(400).send({ error: strErrImage });
    } else {
      const image = sharp(req.file.path);
      image.metadata().then(function (metadata) {
        if (metadata.format && metadata.format !== "jpeg") {
          const newFilename = req.file.filename.replace(/\.png$/i, ".jpg");
          const newImgConvert = req.file.destination + "/" + newFilename;
          image
            .jpeg()
            .toFile(newImgConvert)
            .then(function () {
              fs.unlink(req.file.path, function () {
                const fileInfo = {
                  fieldname: req.file.fieldname,
                  originalname: newFilename,
                  encoding: req.file.encoding,
                  mimetype: "image/jpeg",
                  destination: req.file.destination,
                  filename: req.file.filename.replace(/\.png$/i, ".jpg"),
                  path: req.file.path.replace(/\.png$/i, ".jpg"),
                  size: req.file.size,
                };
                res.send(fileInfo);
              });
            })
            .catch(function (err) {
              res.status(400).send({ error: "Lỗi tải ảnh" });
            });
        } else {
          res.send(req.file);
        }
      });
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
