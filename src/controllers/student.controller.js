import { dummy} from "../models/dummy.model.js";
const addstudent = async (req, res) =>{
    try {
        const { name, age, email } = req.body;
        const student = await dummy.create({
            name,
            age,
            email
        })
        const createdStudent = await student.save();
        
        res.status(201).json({ message: "Student added successfully", student });
    } catch (error) {
        res.status(500).json({ message: "Error adding student", error: error.message });
    }
}
export {addstudent}