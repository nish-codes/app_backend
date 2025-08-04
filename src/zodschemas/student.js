import z, { email } from "zod";

export const studentRequiredSchema = z.object({
    firebaseid: z.string().min(1, "Firebase ID is required"),
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    phone : z.string().min(1, "Phone number is required"),
    profile : z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        
    })
})