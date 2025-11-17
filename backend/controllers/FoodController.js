import Food from "../models/Food.js";

class FoodController {
  // [GET] /foods
  async getAllFoods(req, res) {
    try {
      const { categoryId } = req.query; // lấy categoryId từ query
      const filter = {};
      if (categoryId) filter.category = categoryId; // filter theo category nếu có

      const foods = await Food.find(filter)
        .populate("category", "name image")
        .populate("ingredients.ingredient") // <--- quan trọng
        .sort({ createdAt: -1 });

      res.json(foods);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /foods/:id
  async getFoodById(req, res) {
    try {
      const food = await Food.findById(req.params.id).populate(
        "category",
        "name image"
      );
      if (!food) return res.status(404).json({ message: "Food not found" });
      res.json(food);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [POST] /foods/create
  async createFood(req, res) {
    try {
      const {
        name,
        description,
        price,
        image,
        available,
        tags,
        rating,
        featured,
        ingredients,
        category,
      } = req.body;

      const newFood = new Food({
        name,
        description,
        price,
        image,
        available,
        tags,
        rating,
        featured,
        ingredients,
        category,
      });

      await newFood.save();
      res.status(201).json(newFood);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [PUT] /foods/:id
  async updateFood(req, res) {
    try {
      const updated = await Food.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) return res.status(404).json({ message: "Food not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [DELETE] /foods/:id
  async deleteFood(req, res) {
    try {
      const deleted = await Food.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Food not found" });
      res.json({ message: "Food deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new FoodController();
