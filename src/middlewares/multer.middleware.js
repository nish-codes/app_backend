import multer from "multer";

// storage config for profile photos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

// File filter for PNG, JPG, and JPEG only
function fileFilter(req, file, cb) {
    // Accept only PNG, JPG, and JPEG files
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PNG, JPG, and JPEG files are allowed!'), false);
    }
}

// Create upload middleware for profile photos
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB pic size limit
    },
    fileFilter: fileFilter
});

export { upload };