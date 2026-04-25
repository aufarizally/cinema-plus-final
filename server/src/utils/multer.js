const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = (subFolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      // Kita tentukan folder uploads relatif terhadap file ini berada
      // src/utils -> naik 2 kali ke server/uploads
      const finalDir = path.join(__dirname, '../../uploads', subFolder);

      // Buat folder jika belum ada
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }
      
      cb(null, finalDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

const upload = (subFolder) =>
  multer({
    storage: storage(subFolder),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Hanya boleh upload gambar!'), false);
      }
    },
  });

module.exports = upload;