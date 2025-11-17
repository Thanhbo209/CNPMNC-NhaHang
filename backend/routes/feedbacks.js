    import express from 'express';
    import FeedbackController from '../controllers/FeedbackController.js';

    const router = express.Router();

    router.get('/', FeedbackController.getAllFeedback);

    export default router;

  