import Category from '../models/Category.js';
import Food from "../models/Food.js";

class CategoryController {
    
    // [GET] /categories
    async getAllCategory(req, res) {
        try {
            const categories = await Category.find();
            res.json(categories);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // [GET] /categories/:id
    async getCategoryById(req, res) {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) return res.status(404).json({ message: "Category not found" });
            res.json(category);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // [POST] /categories
    async createCategory(req, res) {
        try {
            const { name, description, image } = req.body;
            const newCategory = new Category({ name, description, image });
            await newCategory.save();
            res.status(201).json(newCategory);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // [PUT] /categories/:id
    async updateCategory(req, res) {
        try {
            const updated = await Category.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (!updated) return res.status(404).json({ message: "Category not found" });
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

     // [DELETE] /categories/:id
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      // Xoá tất cả món ăn thuộc danh mục này
      await Food.deleteMany({ category: id });

      // Xoá danh mục
      await Category.findByIdAndDelete(id);

      res.json({ message: "Đã xóa danh mục và tất cả món ăn thuộc danh mục này" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CategoryController();