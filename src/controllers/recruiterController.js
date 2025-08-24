import { Recruiter } from "../models/recruiter.model.demo";
import { recruiterZodSchema } from "../zodschemas/recruiter.demo";

export const addRecruiter = async (req, res) => {
  try {
    // validate input using Zod
    const parsedData = recruiterZodSchema.parse(req.body);

    //create a nrew recruiter
    const recruiter = new Recruiter(parsedData);
    await recruiter.save();

    return res
      .status(201)
      .json({ message: "Recruiter added successfully", data: recruiter });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
