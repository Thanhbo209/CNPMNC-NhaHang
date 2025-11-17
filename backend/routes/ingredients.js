import express from 'express';
import IngredientController from "../controllers/IngredientController.js";


const router = express.Router();

router.post('/create', IngredientController.createIngredient);
router.put('/:id', IngredientController.updateIngredient);
router.delete('/:id', IngredientController.deleteIngredient);
router.get('/:id', IngredientController.getIngredientById);
router.get('/', IngredientController.getAllIngredient);


export default router;