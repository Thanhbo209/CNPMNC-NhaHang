    import express from 'express';
    import CategoryController from '../controllers/CategoryController.js';

    const router = express.Router();

    router.get('/:id', CategoryController.getCategoryById);
    router.post('/create', CategoryController.createCategory);
    router.put('/:id', CategoryController.updateCategory);
    router.delete('/:id', CategoryController.deleteCategory);
    router.get('/', CategoryController.getAllCategory);

    export default router;

  