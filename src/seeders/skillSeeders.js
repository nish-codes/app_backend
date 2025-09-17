import mongoose from "mongoose";
import { Skill } from '../models/dummy.model.js';
import { connectDb } from "../db/index.js";
import dotenv from 'dotenv';

// Load environment variables immediately
dotenv.config();

//seeders are scripts used to populate a db with initial and default data
const defaultSkills = [
  { name: "Python", description: "A general-purpose programming language." },
  { name: "Marketing", description: "Promoting products or services." },
  { name: "Graphic Design", description: "Creating visual content." },
];

const seedSkills = async () => {
  try {

    await connectDb();
    console.log("Database connected. Starting skill seeding...");

    for (const skillData of defaultSkills) {
      const existingSkill = await Skill.findOne({ name: skillData.name });

      if (!existingSkill) {
        await Skill.create(skillData);
        console.log(`Created skill: ${skillData.name}`);
      } else {
        console.log(`Skill already exists: ${skillData.name}`);
      }
    }
    console.log("Skill seeding complete!");

  } catch (err) {
    console.error("Error during seeding process:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
};

seedSkills();