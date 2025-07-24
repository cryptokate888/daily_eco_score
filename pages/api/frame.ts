if (req.method !== "POST") {
  return res.status(405).json({ error: "Method not allowed" });
}

import { NextApiRequest, NextApiResponse } from "next";

const COMMUTE_CO2 = {
  "Work from Home": 0,
  "Bike": 0,
  "Public Transit": 1.2,
  "Car": 3.6,
};

const FOOD_CO2 = {
  "Vegan": 1.1,
  "Vegetarian": 1.5,
  "Pescatarian": 2.1,
  "Omnivore": 3.4,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get current step and saved answers from the state sent by the Frame client
  const step = req.body.state?.step || "start";
  // Clone answers or start fresh
  const answers = { ...(req.body.state?.answers || {}) };

  let imageUrl = "https://github.com/cryptokate888/daily_eco_score/blob/main/Poster%20-%20Eco%20Score%20Tracking%20App.png"; // Placeholder OG image
  let buttons: string[] = [];
  let nextState: any = {};

  if (step === "start") {
    buttons = ["Start"];
    nextState = { step: "commute", answers };
  } else if (step === "commute") {
    buttons = Object.keys(COMMUTE_CO2);

    // Record user answer based on the button clicked index
    const idx = req.body.buttonIndex;
    if (typeof idx === "number" && buttons[idx]) {
      answers["commute"] = idx;
      nextState = { step: "diet", answers };
    } else {
      // Invalid index, retry same step
      nextState = { step: "commute", answers };
    }
  } else if (step === "diet") {
    buttons = Object.keys(FOOD_CO2);

    const idx = req.body.buttonIndex;
    if (typeof idx === "number" && buttons[idx]) {
      answers["diet"] = idx;

      // Calculate CO2 using selected answers
      const commuteType = Object.keys(COMMUTE_CO2)[answers["commute"]];
      const dietType = Object.keys(FOOD_CO2)[answers["diet"]];

      const totalCO2 = COMMUTE_CO2[commuteType] + FOOD_CO2[dietType];
      imageUrl = `https://yourcdn.com/results?co2=${totalCO2.toFixed(2)}`; // You can customize your OG image URL

      buttons = ["Share", "Restart"];
      nextState = { step: "start", answers: {} }; // Reset after results
    } else {
      // Invalid index, retry diet step
      nextState = { step: "diet", answers };
    }
  } else {
    // Unknown step, restart
    buttons = ["Start"];
    nextState = { step: "commute", answers: {} };
  }

  res.status(200).json({
    image: imageUrl,
    buttons,
    state: nextState,
  });
}
