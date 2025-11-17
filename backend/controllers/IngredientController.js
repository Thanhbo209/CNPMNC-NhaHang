import Ingredient from '../models/Ingredient.js';

class IngredientController {

    // [GET] /api/ingredients
    async getAllIngredient (req, res) {
        try {
            const ingredients = await Ingredient.find();
            res.json(ingredients);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // [GET] /api/ingredients/:id
    async getIngredientById(req, res) {
        try {
            const ingredient = await Ingredient.findById(req.params.id);
            if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
            res.json(ingredient);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

      // [POST] /api/ingredients
    async createIngredient(req, res) {
        try {
            const { name, quantity, unit, alertLevel, image } = req.body;
            
            const ingredient = await Ingredient.create({ name, quantity, unit, alertLevel, image });
            res.status(201).json(ingredient);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // [PUT] /api/ingredients/:id
    async updateIngredient(req, res) {
        try {
            const { name, quantity, unit, alertLevel } = req.body;
            const data = { name, quantity, unit, alertLevel };
            if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }
            const updated = await Ingredient.findByIdAndUpdate(req.params.id, data, { new: true });
            if (!updated) return res.status(404).json({ message: 'Ingredient not found' });
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // [DELETE] /api/ingredients/:id
    async deleteIngredient(req, res) {
        try {
            const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
            if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
            
            // Xóa file ảnh nếu có
            if (ingredient.image) {
                const filePath = path.join('uploads', path.basename(ingredient.image));
                fs.unlink(filePath, err => { if(err) console.log(err) });
            }

            res.json({ message: 'Ingredient deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

}

export default new IngredientController();