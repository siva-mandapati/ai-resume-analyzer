import express from 'express';
import { uploadAndAnalyze, getHistory, getAnalysis, generateCoverLetter } from '../controllers/resumeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadAndAnalyze);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getAnalysis);
router.post('/cover-letter/:id', protect, generateCoverLetter);

export default router;
