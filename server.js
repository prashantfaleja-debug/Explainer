const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyBo87Ga-mAAD8SaITzhBizkt4MlVBTd57E";
if (!apiKey) {
  console.warn("WARNING: GOOGLE_API_KEY not set. Set env var GOOGLE_API_KEY before starting.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Mock recipes for fallback when API quota exceeded
const mockRecipes = {
  "peas,tomato,coriander": "Dish: Fresh Garden Salad Bowl\n1. Chop tomatoes and coriander finely, mix with peas in a bowl\n2. Drizzle with olive oil and lemon juice for dressing\n3. Toss gently, season with salt and pepper, serve chilled as a refreshing starter",
  "chicken,garlic,salt": "Dish: Crispy Garlic Chicken Bites\n1. Cube chicken and marinate in minced garlic and salt for 10 minutes\n2. Heat oil in a pan and fry chicken cubes until golden and crispy\n3. Drain on paper towels, sprinkle extra garlic powder, and serve with dipping sauce",
  "eggs,bread,cheese": "Dish: Gourmet Cheese Toast Supreme\n1. Beat eggs with milk and grated cheese until smooth\n2. Dip bread slices in the mixture, coating both sides well\n3. Fry in butter until golden on both sides, serve hot with a side of fresh herbs"
};

// Mock explanations for fallback
const mockExplanations = {
  "blockchain": "A blockchain is like a chain of boxes. Each box has information in it. When you add a new box, everyone can see it and make sure it's real. Nobody can change old boxes without everyone noticing. It's like a notebook everyone shares and nobody can cheat with!",
  "quantum entanglement": "Imagine you have two magic coins. When you flip one and it lands on heads, the other coin instantly lands on tails—even if it's far away! That's quantum entanglement. Two tiny things are connected so closely that what happens to one instantly affects the other.",
  "climate change": "Earth is getting warmer like when you leave a blanket on. Cars and factories make gases that trap heat around Earth. This makes ice melt, causes hot weather, and makes storms bigger. We need to use less gas and clean energy to help Earth cool down!",
  "car": "A car is a machine with wheels that helps people travel from one place to another. It has an engine inside that makes it go. You sit inside and steer it with a wheel. Cars have brakes to stop and gas to make them go faster!",
  "vehicle": "A vehicle is anything that helps you move from one place to another. Cars, bikes, buses, and airplanes are all vehicles. Some have engines, some you pedal. They all help people get where they want to go!",
  "artificial intelligence": "Artificial intelligence is like a robot brain that can learn and think. It's not alive, but it can solve problems and answer questions. AI watches lots of examples and learns patterns, just like you learn by watching and practicing!",
  "ai": "AI is short for artificial intelligence. It's like a really smart computer that can learn. If you show it lots of pictures of cats, it can learn what a cat looks like and find cats in new pictures!",
  "gravity": "Gravity is an invisible force that pulls things down. When you jump, gravity pulls you back to the ground. The Earth has gravity that keeps you on the ground. Without it, you'd float away into space!",
  "electricity": "Electricity is power that comes through wires and makes things work. Your light bulb uses electricity to shine. Your phone uses electricity to charge. It's like invisible energy that makes our toys and homes work!",
  "internet": "The internet is like a giant web connecting all computers in the world. When you send a message or watch a video, it travels through these connections to reach your phone or computer. Millions of devices talk to each other through the internet!",
  "photosynthesis": "Photosynthesis is how plants eat! Plants use sunlight, water, and air to make their own food. That's why they need sunlight and water to grow. It's like plants have tiny solar panels in their leaves!",
  "dinosaurs": "Dinosaurs were huge animals that lived a very long time ago, before people existed. Some were as big as houses! They walked the Earth millions of years ago, but now they're extinct. We only know about them from fossils.",
  "virus": "A virus is a teeny tiny creature that can make you sick. It's so small you can't see it without a special microscope. When you catch a cold, a virus is making you feel bad. Your body fights it and gets better!",
  "volcano": "A volcano is like a mountain with fire inside! Deep under the ground, it's very hot and melted rock called lava. When pressure builds up, the volcano explodes and lava shoots out. After it cools, the lava becomes rock.",
  "ecosystem": "An ecosystem is a group of animals, plants, and bugs that live together in one place. They all depend on each other. If one disappears, it affects the others. A forest or ocean is an ecosystem!"
};

// Blocked keywords for inappropriate content
const blockedKeywords = [
  "sex", "porn", "adult", "explicit", "nude", "naked", "erotic", "xxx", "nsfw", "pornography",
  "masturbation", "orgasm", "penis", "vagina", "breast", "butt", "ass", "dick", "pussy", "cock",
  "fuck", "shit", "damn", "bitch", "cunt", "whore", "slut", "rape", "incest", "pedophile",
  "drugs", "cocaine", "heroin", "meth", "weed", "marijuana", "alcohol", "beer", "wine", "liquor",
  "violence", "murder", "kill", "death", "blood", "gore", "torture", "abuse", "suicide"
];

function isTopicBlocked(topic) {
  const lowerTopic = topic.toLowerCase();
  return blockedKeywords.some(keyword => lowerTopic.includes(keyword));
}

function getMockRecipe(ingredients) {
  const key = ingredients.map(i => i.toLowerCase().trim()).sort().join(",");
  if (mockRecipes[key]) return mockRecipes[key];

  // Random fallback recipes for variety
  const templates = [
    `Dish: ${ingredients[0]} & ${ingredients[1]} Fusion\n1. Heat oil and sauté ${ingredients[0]}\n2. Add ${ingredients[1]} and ${ingredients[2]}, stir well\n3. Cook until tender, season to taste and serve hot`,
    `Dish: ${ingredients[2]} ${ingredients[0]} Delight\n1. Blend ${ingredients[2]} with ${ingredients[1]} until smooth\n2. Mix in chopped ${ingredients[0]} and heat gently\n3. Season with herbs, chill and serve as a refreshing dish`,
    `Dish: Baked ${ingredients[1]} ${ingredients[0]}\n1. Preheat oven to 375°F and arrange ${ingredients[0]} in a baking dish\n2. Top with ${ingredients[1]} and ${ingredients[2]}, drizzle with oil\n3. Bake for 20-25 minutes until golden, serve warm`,
    `Dish: ${ingredients[0]} ${ingredients[2]} Stir-Fry\n1. Heat wok with oil, add ${ingredients[0]} and stir-fry for 2 minutes\n2. Toss in ${ingredients[2]} and ${ingredients[1]}, cook for another 3 minutes\n3. Season with soy sauce, serve over noodles or rice`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

function getMockExplanation(topic) {
  const key = topic.toLowerCase().trim();
  return mockExplanations[key] || `Think of ${topic} like this: it's something that works in a special way. Just like how a bicycle needs pedals to move and a light needs electricity to shine, ${topic} has its own special parts that make it work. It's one of those cool things that grown-ups and kids can learn about together!`;
}

app.post("/api/explain", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return res.status(400).json({ error: "Topic is required" });
    }

    if (isTopicBlocked(topic.trim())) {
      return res.status(400).json({ error: "Sorry, this topic is not appropriate for our family-friendly explainer app. Please choose a different topic!" });
    }

    const prompt = `Explain the following topic in a simple way for a 5-year-old: ${topic.trim()}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      res.json({ explanation: text });
    } catch (geminiError) {
      // Fallback to mock explanations on API failure
      console.log("Gemini API failed, using fallback mock explanation");
      const mockExpl = getMockExplanation(topic);
      res.json({ explanation: mockExpl });
    }
  } catch (error) {
    console.error(error);
    const message = error?.response?.data || error.message || "Unknown error";
    res.status(500).json({ error: "Gemini error", details: message });
  }
});

app.post("/api/fridge", async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length !== 3 || ingredients.some(i => typeof i !== 'string' || !i.trim())) {
      return res.status(400).json({ error: "Exactly 3 non-empty ingredient strings are required" });
    }

    const ingList = ingredients.map(i => i.trim()).join(', ');
    const prompt = `You are a creative refrigerator chef. Given ingredients: ${ingList}, suggest a fancy dish name and a simple 3-step recipe. Keep the response concise and formatted like:\nDish: <name>\n1. ...\n2. ...\n3. ...`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      res.json({ recipe: text });
    } catch (geminiError) {
      // Fallback to mock recipes on API failure
      console.log("Gemini API failed, using fallback mock recipe");
      const mockRecipe = getMockRecipe(ingredients);
      res.json({ recipe: mockRecipe });
    }
  } catch (error) {
    console.error(error);
    const message = error?.response?.data || error.message || "Unknown error";
    res.status(500).json({ error: "Gemini error", details: message });
  }
});

app.listen(port, () => {
  console.log(`Gemini explainer app running on http://localhost:${port}`);
});
