const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/public/temp')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname))
  }
})

module.exports.upload = multer({ storage: storage })