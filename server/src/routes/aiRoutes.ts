import express from 'express';
import { handleChat } from '../controllers/aiController';

const router = express.Router();

router.post('/chat', handleChat);

export default router;
