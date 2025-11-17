    import express from 'express';
    import UserController from '../controllers/UserController.js';

    const router = express.Router();

    router.post('/create', UserController.createUser);
    router.put('/:id', UserController.updateUser);
    router.delete('/:id', UserController.deleteUser);
    router.get('/', UserController.getAllUsers);

    export default router;

  