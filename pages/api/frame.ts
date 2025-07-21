// pages/api/frame.ts
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
  const step = req.body.state?.step || "start";
  const answers = req.body.state?.answers || {};

  let imageUrl = "https://yourcdn.com/frame.png"; // Placeholder OG image
  let buttons = [];
  let nextState = {};

  if (step === "start") {
    buttons = ["Start"];
    nextState = { step: "commute" };
  } else if (step === "commute") {
    buttons = Object.keys(COMMUTE_CO2);
    nextState = { step: "diet" };
    answers["commute"] = req.body.buttonIndex;
  } else if (step === "diet") {
    buttons = Object.keys(FOOD_CO2);
    answers["diet"] = req.body.buttonIndex;

    const commuteType = Object.keys(COMMUTE_CO2)[answers["commute"]];
    const dietType = Object.keys(FOOD_CO2)[req.body.buttonIndex];

    const totalCO2 = COMMUTE_CO2[commuteType] + FOOD_CO2[dietType];
    imageUrl = `https://yourcdn.com/results?co2=${totalCO2}`; // optional image customization
    buttons = ["Share", "Restart"];
    nextState = { step: "start" };
  }

  res.status(200).json({
    image: imageUrl,
    buttons,
    state: nextState,
  });
}
