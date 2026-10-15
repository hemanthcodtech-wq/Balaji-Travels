import { Router } from 'express';
import { upload } from '../config/cloudinary.js';

const router = Router();

/**
 * POST /api/upload
 * Expects multipart form-data with field name "image"
 */
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    // multer-storage-cloudinary provides the secure url in path / secure_url
    const imageUrl = req.file.path || req.file.secure_url;
    const publicId = req.file.filename || req.file.public_id;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary.',
      url: imageUrl,
      public_id: publicId,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error uploading image.' });
  }
});

export default router;
