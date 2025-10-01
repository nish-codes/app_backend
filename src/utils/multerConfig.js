import multer from "multer";
import path from "path";

// Profile photo storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

// File filter for profile photos (PNG, JPG, JPEG only)
function fileFilter(req, file, cb) {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PNG, JPG, and JPEG files are allowed!'), false);
    }
}

// Profile photo upload configuration
const profilePhotoUpload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB for profile photos
    },
    fileFilter: fileFilter
});

export { profilePhotoUpload };