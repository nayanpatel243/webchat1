const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const gm = require('gm');

const utils = require('../lib/general');
const Upload = require('../models/upload');

const router = express.Router();


const chatStorage = multer.diskStorage({
  destination(req, file, cb) {
    const chatBaseDir = `${__dirname}/../public/uploads/chat/`;
    const chatUploadDir = chatBaseDir + req.user._id;

    fs.exists(chatUploadDir, (exists) => {
      if (!exists) {
        fs.mkdir(chatUploadDir, (err) => {
          if (err) {
            console.log('Error in chatUploadDir creation');
            cb(null, false);
          } else {
            cb(null, chatUploadDir);
          }
        });
      } else {
        cb(null, chatUploadDir);
      }
    });
  },
  filename(req, file, cb) {
    cb(null, `${utils.getRandomNumberofLength(6)}${Date.now()}.${file.mimetype.split('/')[1]}`);
  },
});

const chatUploads = multer({
  storage: chatStorage,
  fileFilter: function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname);
    const extAllowed = ['.png', '.jpg', '.jpeg', '.doc', '.docx', '.pdf', '.mp4', '.aac', '.mp3'];
    if (!extAllowed.includes(ext)) {
      cb(new Error(`Invalid Format: Allowed Types are${extAllowed.toString()}`));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

// chat file uploads.
const upload = chatUploads.single('chat');

router.post('/upload', (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return res.status(422).json({ success: false, message: 'Input file chat must not be empty' });
    }

    const uploadData = {
      originalName: req.file.originalname,
      mime: req.file.mimetype,
      size: req.file.size,
    };

    Upload.findOne(uploadData, (err, doc) => {
      if (err) return next(err);
      if (doc) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.log(err);
        });

        const docFileNameArray = doc.fileName.split('.');
        const docFileName = docFileNameArray[0];
        const docFileExt = docFileNameArray[1];
        let docThumbName = `${docFileName}_thumb.${docFileExt}`;
        let thumbnailurl = `${config.serverbaseUrl + doc.userId}/${docThumbName}`;

        const oldfileThumbPath = `${__dirname}/../public/uploads/chat/${doc.userId}/${docThumbName}`;

        fs.exists(oldfileThumbPath, (exists) => {
          console.log('ex ', exists);
          if (!exists) {
            docThumbName = null;
            thumbnailurl = null;
          }
          const oldDoc = {
            originalName: doc.originalName,
            mimetype: doc.mime,
            size: doc.size,
            fileName: doc.fileName,
            thumbnailurl,
            thumbnail: docThumbName,
            fileurl: `${config.serverbaseUrl + doc.userId}/${req.file.filename}`,
          };

          return res.json({ success: false, doc: oldDoc });
        });

        console.log('ex fd');
      }

      const filePath = req.file.path.substring(0, req.file.path.indexOf(req.file.filename));
      const fileNameArray = req.file.filename.split('.');
      const fileName = fileNameArray[0];
      const fileExt = fileNameArray[1];
      const thumbName = `${fileName}_thumb.${fileExt}`;
      const thumbFullPath = filePath + thumbName;

      gm(req.file.path).thumb(150, 150, thumbFullPath, 20, (gmErr) => {
        console.log(gmErr);
        req.file.fileurl = `${config.serverbaseUrl + req.user._id}/${req.file.filename}`;
        if (gmErr) {
          req.file.thumbnail = null;
          req.file.thumbnailurl = null;
        } else {
          req.file.thumbnail = thumbName;
          req.file.thumbnailurl = `${config.serverbaseUrl + req.user._id}/${thumbName}`;
        }

        uploadData.userId = req.user._id;
        uploadData.fileName = req.file.filename;

        Upload.create(uploadData, (uploadErr) => {
          if (uploadErr) {
            return next(uploadErr);
          }
          delete req.file.path;
          delete req.file.destination;
          delete req.file.fieldname;
          delete req.file.encoding;
          return res.json({ success: true, data: req.file });
        });
      });
    });
  });
});

module.exports = router;
