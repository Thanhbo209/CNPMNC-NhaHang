    import express from 'express';
    import FoodController from '../controllers/FoodController.js';

    const router = express.Router();

    router.get('/:id', FoodController.getFoodById);
    router.post('/create', FoodController.createFood);
    router.put('/:id', FoodController.updateFood);
    router.delete('/:id', FoodController.deleteFood);
    router.get('/', FoodController.getAllFoods);

    export default router;

  