const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Only JPG and PNG files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

// Update user profile
router.post('/profile', auth, upload.single('photograph'), async (req, res) => {
    try {
        const { weight, height, medicalHistory } = req.body;
        const userId = req.user.id;

        const updateData = {
            weight,
            height,
            medicalHistory
        };

        if (req.file) {
            updateData.photograph = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get YouTube URL
router.get('/youtube-url', auth, (req, res) => {
    res.json({ url: 'https://www.youtube.com/watch?v=enYITYwvPAQ' });
});

module.exports = router;
