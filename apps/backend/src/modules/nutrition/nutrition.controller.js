const { getFoodNutrition } = require('../../integrations/usda.integration');
const logger = require('../../shared/utils/logger');

const NUTRITION_UNAVAILABLE_MESSAGE = "Nutrition data unavailable";

const DEMO_NUTRITION = {
	"sweet potato chaat": { calories: 86, protein: 1.6 },
	"whole wheat pasta primavera": { calories: 149, protein: 5.5 },
	"sesame tofu bowl": { calories: 144, protein: 15.8 },
	"yogurt chia parfait": { calories: 120, protein: 4.1 },
	"moong dal dosa": { calories: 168, protein: 7.5 },
	"barley vegetable soup": { calories: 56, protein: 1.9 },
	"roasted lotus seeds": { calories: 347, protein: 9.7 },
	"apple peanut slices": { calories: 120, protein: 3.5 },
};

// Controller keeps HTTP-level concerns separate from USDA service logic.
async function getNutritionByFood(req, res) {
	const foodName = decodeURIComponent(String(req.params.food || "")).trim();

	if (!foodName) {
		return res.status(400).json({
			message: "Food name is required.",
		});
	}

	if (process.env.DEMO_MODE === "true") {
		const nutrition = DEMO_NUTRITION[foodName.toLowerCase()] || { calories: 110, protein: 4.2 };
		return res.status(200).json({
			food: foodName,
			calories: nutrition.calories,
			protein: nutrition.protein,
			serving: "per 100g",
			source: "SAKHI local demo data",
		});
	}

	try {
		const nutrition = await getFoodNutrition(foodName);

		if (!nutrition) {
			return res.status(404).json({
				message: NUTRITION_UNAVAILABLE_MESSAGE,
			});
		}

		return res.status(200).json(nutrition);
	} catch (error) {
		logger.error({ msg: "USDA fetch failed", foodName, error: error.message });

		return res.status(503).json({
			message: NUTRITION_UNAVAILABLE_MESSAGE,
		});
	}
}

module.exports = {
	getNutritionByFood,
};
