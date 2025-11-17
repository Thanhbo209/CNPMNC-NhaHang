import Feedback from '../models/Feedback.js';

class FeedbackController {
    
    // [GET] /feedbacks
    async getAllFeedback(req, res) {
        try {
            const feedBacks = await Feedback.find();
            res.json(feedBacks);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default new FeedbackController();