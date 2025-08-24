import { z } from "zod";
import mongoose from "mongoose";

//Helper for ObjectId from "mongoose" validation;
const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

//Recruiter Schema
export const recruiterZodSchema = z.object({
  firebaseId: z.string().min(1, "Firebase ID is required"),
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid Email Address").min(1, "Email is required"),
  phone: z.string().optional(),
  profile_photo_url: z.string().optional(),
  designation: z.string().min(1, "Designation is required"),
  is_verified: z.boolean().default(false),
  verification_status: z
    .enum(["pending", "verified", "rejected"])
    .default("pending"),

  // Company details
  company_id: objectIdSchema,
  company_context: z.object({
    company_name: z.string().min(1, "Company name is required"),
    company_type: z
      .enum(["Startup", "MNC", "NGO"])
      .min(1, "Company type is required"),
    industry: z.string().min(1, "Industry is required"),
    location: z.string().min(1, "Location is required"),
  }),

  //Engagement Data
  activity_engagement: z
    .object({
      jobs_posted: z.number().nonnegative().default(0),
      active_jobs: z.array(objectIdSchema).optional(1),
      candidate_matches: z
        .array(
          z.object({
            candidate_id: objectIdSchema,
            match_score: z.number().min(0).max(100).optional(), //assume % match score
          })
        )
        .optional(1),
    })
    .optional(),
  location_preferences: z
    .enum(["Remote", "On-site", "Hybrid"])
    .default("Remote"),
  experience_level: z
    .enum(["Fresher", "0-2 yrs", "2-5 yrs", "5+ yrs"])
    .default("Fresher"),
  created_at: z.date().default(() => new Date()),
});
