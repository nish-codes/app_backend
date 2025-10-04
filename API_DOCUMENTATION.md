# 🚀 API Documentation - Job Portal Backend

## 📋 Table of Contents
- [Authentication](#authentication)
- [Student Routes](#student-routes)
- [Recruiter Routes](#recruiter-routes)
- [Company Routes](#company-routes)
- [College Routes](#college-routes)
- [Admin Routes](#admin-routes)
- [Skills & Questions Routes](#skills--questions-routes)
- [Job Routes](#job-routes)
- [Common Response Formats](#common-response-formats)
- [Error Handling](#error-handling)

---

## 🔐 Authentication

All protected routes require Firebase authentication token in the header:
```
Authorization: Bearer <firebase_token>
```

---

## 👨‍🎓 Student Routes
**Base URL:** `/student`

### 1. Student Signup
**POST** `/student/signup`

**Description:** Register a new student account

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "profile": {
    "FullName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Passionate software developer with 2 years of experience...",
    "about": "I am a dedicated computer science student with a strong interest in web development...",
    "dateOfBirth": "2000-01-01",
    "phone": "1234567890",
    "address": "123 Main St"
  },
  "education": {
    "college": "University Name",
    "degree": "Bachelor of Technology",
    "branch": "Computer Science",
    "yearOfPassing": 2024,
    "cgpa": 8.5
  },
  "user_skills": {
    "JavaScript": "mid",
    "React": "beginner",
    "Node.js": "advance"
  }
}
```

**Response (Success):**
```json
{
  "message": "Student created successfully",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "firebaseId": "firebase_uid_12345",
    "email": "john@example.com",
    "phone": "1234567890",
    "profile": {
      "FullName": "John Doe",
      "profilePicture": "https://cloudinary.com/profile.jpg",
      "bio": "Passionate software developer with 2 years of experience...",
      "about": "I am a dedicated computer science student with a strong interest in web development..."
    },
    "education": {
      "college": "University of Technology",
      "universityType": "public",
      "degree": "Bachelor of Technology",
      "collegeEmail": "john@university.edu",
      "yearOfPassing": 2024
    },
    "user_skills": {
      "JavaScript": { "level": "unverified" },
      "React": { "level": "beginner" },
      "Node.js": { "level": "unverified" }
    },
    "job_preference": ["Software Development", "Web Development"],
    "experience": [
      {
        "nameOfOrg": "Tech Internship Co.",
        "position": "Frontend Developer Intern",
        "timeline": "Summer 2023",
        "description": "Worked on React applications..."
      }
    ],
    "projects": [
      {
        "projectName": "E-commerce Website",
        "link": "https://github.com/john/ecommerce",
        "description": "Full-stack e-commerce application built with React and Node.js"
      }
    ],
    "saves": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "exists": true
}
```

**Response (Error - User Already Exists):**
```json
{
  "message": "User already exists",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "firebaseId": "firebase_uid_12345",
    "email": "john@example.com",
    "profile": { ... },
    "education": { ... },
    "user_skills": { ... }
  }
}
```

**Response (Error - Validation Failed):**
```json
{
  "message": "Validation failed",
  "errors": {
    "profile.FullName": "FullName is required",
    "email": "Email must be a valid email address"
  },
  "details": "ValidationError: profile.FullName: FullName is required"
}
```

### 2. Check User
**GET** `/student/check`

**Description:** Check if user exists in database

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "exists": true,
  "userType": "student",
  "user": { ... }
}
```

### 3. Student Login
**POST** `/student/login`

**Description:** Login existing student

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... }
}
```

### 5. Add Skills
**POST** `/student/addSkills`

**Description:** Add a skill to student profile (starts as unverified)

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "skillName": "JavaScript"
}
```

**Response (Success):**
```json
{
  "message": "Skill added successfully",
  "skills": {
    "JavaScript": { "level": "unverified" },
    "React": { "level": "beginner" },
    "Node.js": { "level": "unverified" }
  }
}
```

**Response (Error - Skill Already Exists):**
```json
{
  "message": "Skill already exists"
}
```

**Response (Error - Missing Skill Name):**
```json
{
  "message": "Skill name is required"
}
```

### 6. Verify Skills (Manual)
**POST** `/student/verifySkills`

**Description:** Manually verify student skills (only works for unverified skills)

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "skillName": "JavaScript",
  "level": "beginner"
}
```

**Response (Success):**
```json
{
  "message": "Skill level updated successfully through manual verification",
  "skills": {
    "JavaScript": { "level": "beginner" },
    "React": { "level": "unverified" },
    "Node.js": { "level": "mid" }
  }
}
```

**Response (Error - Skill Already Verified):**
```json
{
  "message": "Skill is already verified. Take a quiz to improve your level or reset the skill to unverified first."
}
```

**Response (Error - Invalid Level):**
```json
{
  "message": "Invalid skill level"
}
```

**Response (Error - Skill Not Found):**
```json
{
  "message": "Skill does not exist. Add it first."
}
```

**Note:** Manual verification only works if the skill is currently "unverified". For quiz-based verification, use `/skills/submitQuiz`.

### 7. Reset Skill
**POST** `/student/resetSkill`

**Description:** Reset a skill back to unverified (allows retaking quiz)

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "skillName": "JavaScript"
}
```

**Response (Success):**
```json
{
  "message": "Skill reset to unverified successfully. You can now retake the quiz.",
  "skills": {
    "JavaScript": { "level": "unverified" },
    "React": { "level": "beginner" },
    "Node.js": { "level": "mid" }
  }
}
```

**Response (Error - Skill Not Found):**
```json
{
  "message": "Skill does not exist. Add it first."
}
```

**Skill Levels:**
- `unverified` (default when adding skills)
- `beginner` (0.5 weight in job matching)
- `mid` (1.0 weight in job matching)
- `advance` (1.5 weight in job matching)

### 8. Get Student Details
**POST** `/student/StudentDetails`

**Description:** Get detailed student information

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "success": true,
  "student": { ... }
}
```

### 8. Get Jobs
**GET** `/student/jobs`

**Description:** Get job opportunities for students

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Found 5 opportunities: 3 skills-matched, 2 general",
  "opportunities": [
    {
      "_id": "job_id",
      "title": "Software Engineer",
      "description": "Job description...",
      "salaryRange": { "min": 50000, "max": 80000 },
      "recruiter": {
        "name": "John Doe",
        "email": "john@company.com"
      },
      "company": {
        "name": "Tech Corp",
        "industry": "Technology",
        "logo": "https://..."
      },
      "matchingSkills": ["JavaScript", "React"],
      "matchingSkillsCount": 2,
      "priority": "skills-based"
    }
  ],
  "totalCount": 5,
  "searchStrategy": "skills-based"
}
```

### 9. Get Hackathons
**GET** `/student/hackathons`

**Description:** Get available hackathons

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "success": true,
  "hackathons": [
    {
      "_id": "hackathon_id",
      "name": "Tech Hackathon 2024",
      "description": "Build innovative solutions...",
      "startDate": "2024-03-01",
      "endDate": "2024-03-03",
      "prize": "$10,000"
    }
  ]
}
```

### 10. Apply to Job
**POST** `/student/jobs/:jobId/apply`

**Description:** Apply to a specific job

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "coverLetter": "I am interested in this position...",
  "resume": "https://resume_url"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "_id": "application_id",
    "job": "job_id",
    "candidate": "student_id",
    "status": "applied",
    "coverLetter": "...",
    "resume": "..."
  }
}
```

### 11. Update Student Profile
**PUT** `/student/profile`

**Description:** Update student profile information

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "profile": {
    "FullName": "John Smith",
    "phone": "9876543210"
  },
  "education": {
    "cgpa": 9.0
  }
}
```

### 12. Get Applications
**GET** `/student/applications`

**Description:** Get a student's applications with optional filtering and pagination

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Query Parameters:**
- `status` (optional): `applied` | `shortlisted` | `rejected` | `hired`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sort` (optional): Sort order (default: `-createdAt`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "application_id",
      "job": {
        "_id": "job_id",
        "title": "Software Engineer",
        "preferences": { "skills": ["JavaScript", "Node.js"] },
        "location": "Remote",
        "createdAt": "2024-01-15T10:30:00Z",
        "recruiter": {
          "name": "John Doe",
          "email": "john@company.com",
          "designation": "HR Manager",
          "companyId": {
            "_id": "company_id",
            "name": "Tech Corp",
            "industry": "Technology",
            "location": { "city": "San Francisco" },
            "logo": "https://..."
          }
        }
      },
      "status": "applied",
      "matchScore": 82,
      "createdAt": "2024-01-16T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### 13. Get Application Counts
**GET** `/student/applications/counts`

**Description:** Summary of the student's applications by status

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "applied": 7,
    "shortlisted": 3,
    "rejected": 1,
    "hired": 1
  }
}
```

Additional count endpoints:
- `GET` `/student/applications/counts/applied` → `{ "success": true, "count": 7 }`
- `GET` `/student/applications/counts/shortlisted` → `{ "success": true, "count": 3 }`

### 14. Get Student Analytics
**GET** `/student/analytics`

**Description:** Detailed analytics for the student's applications

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totals": {
      "total": 12,
      "applied": 7,
      "shortlisted": 3,
      "rejected": 1,
      "hired": 1
    },
    "conversion": {
      "shortlistRate": 42.86,
      "hireRate": 14.29,
      "rejectionRate": 14.29
    },
    "trend": [
      { "month": "2024-08", "applied": 2, "shortlisted": 1, "rejected": 0, "hired": 0 },
      { "month": "2024-09", "applied": 3, "shortlisted": 1, "rejected": 1, "hired": 0 },
      { "month": "2024-10", "applied": 2, "shortlisted": 1, "rejected": 0, "hired": 1 }
    ],
    "recentApplications": [
      {
        "_id": "application_id",
        "status": "shortlisted",
        "createdAt": "2024-10-01T12:00:00Z",
        "job": {
          "_id": "job_id",
          "title": "Backend Engineer",
          "preferences": { "skills": ["Node.js", "MongoDB"] },
          "location": "Remote",
          "recruiter": {
            "name": "Jane Smith",
            "email": "jane@company.com",
            "designation": "Recruiter",
            "companyId": { "name": "Tech Corp", "logo": "https://..." }
          }
        }
      }
    ]
  }
}
```

---

## 👨‍💼 Recruiter Routes
**Base URL:** `/recruiter`

### 1. Recruiter Signup
**POST** `/recruiter/signup`

**Description:** Register a new recruiter account

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "designation": "HR Manager",
  "companyId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Response:**
```json
{
  "message": "Recruiter created successfully",
  "user": {
    "_id": "recruiter_id",
    "name": "John Doe",
    "email": "john@company.com",
    "companyId": {
      "_id": "company_id",
      "name": "Tech Corp",
      "industry": "Technology",
      "location": { "city": "San Francisco" },
      "logo": "https://..."
    }
  }
}
```

### 2. Recruiter Login
**POST** `/recruiter/login`

**Description:** Login existing recruiter

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "recruiter_id",
    "name": "John Doe",
    "email": "john@company.com",
    "companyId": {
      "_id": "company_id",
      "name": "Tech Corp",
      "industry": "Technology"
    }
  }
}
```

### 3. Post Job
**POST** `/recruiter/jobs`

**Description:** Create a new job posting

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Software Engineer",
  "description": "We are looking for a skilled software engineer...",
  "salaryRange": {
    "min": 50000,
    "max": 80000
  },
  "preferences": {
    "skills": ["JavaScript", "React", "Node.js"],
    "minExperience": 2,
    "education": "Bachelor's Degree",
    "location": "San Francisco"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "job": {
    "_id": "job_id",
    "title": "Software Engineer",
    "description": "...",
    "recruiter": {
      "name": "John Doe",
      "email": "john@company.com"
    },
    "company": {
      "name": "Tech Corp",
      "industry": "Technology",
      "logo": "https://..."
    },
    "salaryRange": { "min": 50000, "max": 80000 },
    "preferences": { ... }
  }
}
```

### 4. Get Applications
**GET** `/recruiter/jobs`

**Description:** Get job applications and opportunities (for students)

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Found 5 opportunities: 3 skills-matched, 2 general",
  "opportunities": [ ... ],
  "totalCount": 5,
  "searchStrategy": "skills-based"
}
```

### 5. Update Application Status
**PUT** `/recruiter/applications/:applicationId/status`

**Description:** Update application status (shortlisted, rejected, hired)

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "shortlisted"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "application": {
    "_id": "application_id",
    "status": "shortlisted",
    "candidate": {
      "email": "student@example.com",
      "profile": {
        "firstName": "Jane",
        "lastName": "Doe"
      }
    }
  }
}
```

---

## 🏢 Company Routes
**Base URL:** `/company`

### 1. Register Company
**POST** `/company/register`

**Description:** Register a new company

**Request Body:**
```json
{
  "name": "Tech Corp",
  "description": "Leading technology company",
  "industry": "Technology",
  "website": "https://techcorp.com",
  "location": {
    "address": "123 Tech Street",
    "city": "San Francisco",
    "state": "California",
    "country": "USA",
    "zipcode": "94105"
  },
  "size": "201-500",
  "companyType": "MNC",
  "founded": 2010,
  "logo": "https://logo_url"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Company registered successfully",
  "company": {
    "_id": "company_id",
    "name": "Tech Corp",
    "description": "Leading technology company",
    "industry": "Technology",
    "website": "https://techcorp.com",
    "location": { ... },
    "size": "201-500",
    "companyType": "MNC",
    "founded": 2010,
    "logo": "https://logo_url",
    "recruiters": [],
    "jobs": []
  }
}
```

### 2. Get All Companies
**GET** `/company/`

**Description:** Get list of all companies

**Response:**
```json
{
  "success": true,
  "companies": [
    {
      "_id": "company_id",
      "name": "Tech Corp",
      "industry": "Technology",
      "recruiters": [
        {
          "_id": "recruiter_id",
          "name": "John Doe",
          "email": "john@techcorp.com"
        }
      ],
      "jobs": [
        {
          "_id": "job_id",
          "title": "Software Engineer",
          "description": "..."
        }
      ]
    }
  ],
  "totalCount": 10
}
```

### 3. Get Company by ID
**GET** `/company/:companyId`

**Description:** Get detailed company information

**Response:**
```json
{
  "success": true,
  "company": {
    "_id": "company_id",
    "name": "Tech Corp",
    "description": "...",
    "industry": "Technology",
    "recruiters": [
      {
        "_id": "recruiter_id",
        "name": "John Doe",
        "email": "john@techcorp.com",
        "designation": "HR Manager",
        "phone": "1234567890",
        "profilePicture": "https://...",
        "isVerfied": true,
        "verificationStatus": "verified"
      }
    ],
    "jobs": [
      {
        "_id": "job_id",
        "title": "Software Engineer",
        "description": "...",
        "salaryRange": { "min": 50000, "max": 80000 },
        "preferences": { ... },
        "jobType": "company",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 4. Update Company
**PUT** `/company/:companyId`

**Description:** Update company information

**Request Body:**
```json
{
  "description": "Updated company description",
  "website": "https://new-website.com",
  "size": "501-1000"
}
```

### 5. Delete Company
**DELETE** `/company/:companyId`

**Description:** Delete company (only if no active recruiters)

**Response:**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

### 6. Get Company Jobs
**GET** `/company/:companyId/jobs`

**Description:** Get jobs posted by specific company

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `jobType` (optional): Filter by job type

**Response:**
```json
{
  "success": true,
  "jobs": [ ... ],
  "totalJobs": 25,
  "totalPages": 3,
  "currentPage": 1
}
```

### 7. Get Company Recruiters
**GET** `/company/:companyId/recruiters`

**Description:** Get recruiters belonging to specific company

**Response:**
```json
{
  "success": true,
  "recruiters": [
    {
      "_id": "recruiter_id",
      "name": "John Doe",
      "email": "john@techcorp.com",
      "phone": "1234567890",
      "designation": "HR Manager",
      "profilePicture": "https://...",
      "isVerfied": true,
      "verificationStatus": "verified"
    }
  ],
  "totalCount": 5
}
```

---

## 🎓 College Routes
**Base URL:** `/college`

### 1. College Signup
**POST** `/college/signup`

**Description:** Register a new college account

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "University of Technology",
  "email": "admin@university.edu",
  "phone": "1234567890",
  "address": "123 University Ave",
  "website": "https://university.edu",
  "accreditation": "NAAC A+",
  "establishedYear": 1990
}
```

### 2. College Login
**POST** `/college/login`

**Description:** Login existing college

**Headers:**
```
Authorization: Bearer <firebase_token>
```

### 3. Get College Students
**GET** `/college/students`

**Description:** Get list of students from the college

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name or email

### 4. Get Student Details
**GET** `/college/students/:studentId`

**Description:** Get detailed student information

**Headers:**
```
Authorization: Bearer <firebase_token>
```

### 5. Post On-Campus Opportunity
**POST** `/college/opportunities`

**Description:** Post on-campus job opportunity

**Request Body:**
```json
{
  "title": "Campus Ambassador",
  "description": "Represent our company on campus...",
  "companyName": "Tech Corp",
  "applicationLink": "https://apply.techcorp.com",
  "deadline": "2024-03-31",
  "requirements": ["Communication skills", "Leadership"]
}
```

### 6. Get College Opportunities
**GET** `/college/opportunities`

**Description:** Get on-campus opportunities

**Headers:**
```
Authorization: Bearer <firebase_token>
```

### 7. Update College Profile
**PUT** `/college/profile`

**Description:** Update college profile information

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

### 8. Get College Analytics
**GET** `/college/analytics`

**Description:** Get college analytics and statistics

**Headers:**
```
Authorization: Bearer <firebase_token>
```

---

## 👨‍💻 Admin Routes
**Base URL:** `/admin`

### 1. Create Hackathon
**POST** `/admin/createHackathon`

**Description:** Create a new hackathon

**Request Body:**
```json
{
  "name": "Tech Hackathon 2024",
  "description": "Build innovative solutions for real-world problems",
  "startDate": "2024-03-01T09:00:00Z",
  "endDate": "2024-03-03T18:00:00Z",
  "prize": "$10,000",
  "rules": ["No plagiarism", "Team size max 4"],
  "registrationDeadline": "2024-02-25T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hackathon created successfully",
  "hackathon": {
    "_id": "hackathon_id",
    "name": "Tech Hackathon 2024",
    "description": "...",
    "startDate": "2024-03-01T09:00:00Z",
    "endDate": "2024-03-03T18:00:00Z",
    "prize": "$10,000",
    "rules": [ ... ],
    "registrationDeadline": "2024-02-25T23:59:59Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🛠️ Skills & Questions Routes
**Base URL:** `/skills`

### 1. Get Questions
**GET** `/skills/questions`

**Description:** Get assessment questions for skills verification

**Query Parameters:**
- `lvl`: Difficulty level (`Beginner`, `Intermediate`, `Advanced`)
- `skill`: Skill name (e.g., `JavaScript`, `React`, `Python`)

**Example:** `GET /skills/questions?lvl=Beginner&skill=JavaScript`

**Response (Success):**
```json
[
  {
    "Question": "What is the difference between let and var?",
    "1": "let has block scope, var has function scope",
    "2": "var has block scope, let has function scope", 
    "3": "Both have the same scope",
    "4": "let is deprecated"
  },
  {
    "Question": "Which method is used to add elements to an array?",
    "1": "push()",
    "2": "add()",
    "3": "insert()",
    "4": "append()"
  },
  {
    "Question": "What does the 'this' keyword refer to in JavaScript?",
    "1": "The current function",
    "2": "The current object",
    "3": "The global object",
    "4": "The parent object"
  }
]
```

**Response (Error - No Questions Found):**
```json
{
  "message": "No matching skill found"
}
```

### 2. Get Skills
**GET** `/skills/getSkills`

**Description:** Get list of available skills

**Response (Success):**
```json
[
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "HTML",
  "CSS",
  "MongoDB",
  "Express.js",
  "TypeScript",
  "Vue.js",
  "Angular",
  "Django",
  "Flask",
  "Spring Boot",
  "MySQL",
  "PostgreSQL",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Git"
]
```

### 3. Get Job Preferences
**GET** `/skills/JobPrefernce`

**Description:** Get job preference options

**Response (Success):**
```json
[
  "Software Development",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "DevOps",
  "UI/UX Design",
  "Product Management",
  "Quality Assurance",
  "Machine Learning",
  "Artificial Intelligence",
  "Cloud Computing",
  "Cybersecurity",
  "Blockchain",
  "Game Development",
  "Full Stack Development",
  "Frontend Development",
  "Backend Development"
]
```

### 4. Submit Quiz Results
**POST** `/skills/submitQuiz`

**Description:** Submit quiz results and automatically update skill level

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "skillName": "JavaScript",
  "difficulty": "Beginner",
  "score": 8,
  "totalQuestions": 10,
  "answers": [
    {
      "questionId": "1",
      "selectedAnswer": "1"
    }
  ]
}
```

**Response (Success - High Score):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "skillName": "JavaScript",
    "difficulty": "Beginner",
    "score": 8,
    "totalQuestions": 10,
    "percentageScore": 80,
    "newLevel": "beginner",
    "skillUpdated": true
  }
}
```

**Response (Success - Medium Score):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "skillName": "React",
    "difficulty": "Intermediate",
    "score": 6,
    "totalQuestions": 10,
    "percentageScore": 60,
    "newLevel": "beginner",
    "skillUpdated": true
  }
}
```

**Response (Success - Low Score):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "skillName": "Node.js",
    "difficulty": "Advanced",
    "score": 4,
    "totalQuestions": 10,
    "percentageScore": 40,
    "newLevel": "unverified",
    "skillUpdated": false
  }
}
```

**Response (Error - Missing Fields):**
```json
{
  "success": false,
  "message": "Missing required fields: skillName, difficulty, score, totalQuestions"
}
```

**Response (Error - Skill Not Found):**
```json
{
  "success": false,
  "message": "Skill does not exist. Add the skill first before taking the quiz."
}
```

**Response (Error - Student Not Found):**
```json
{
  "success": false,
  "message": "Student not found"
}
```

**Skill Level Assignment Logic:**
- **Score ≥80%**: Can achieve the quiz difficulty level
- **Score 60-79%**: Achieves beginner level (or current level if higher)
- **Score <60%**: Remains unverified

---

## 💼 Job Routes
**Base URL:** `/jobs`

### 1. Create Job(s)
**POST** `/jobs/`

**Description:** Create single or multiple jobs

**Request Body (Single Job):**
```json
{
  "title": "Software Engineer",
  "description": "Job description...",
  "rolesAndResponsibilities": "Develop and maintain web applications...",
  "perks": "Health insurance, flexible hours, remote work...",
  "details": "Additional job details and requirements...",
  "jobType": "company",
  "employmentType": "full-time",
  "noOfOpenings": 3,
  "duration": "6 months",
  "mode": "hybrid",
  "stipend": 5000,
  "recruiter": "recruiter_id",
  "salaryRange": { "min": 50000, "max": 80000 },
  "preferences": {
    "skills": ["JavaScript", "React", "Node.js"],
    "minExperience": 1,
    "education": "Bachelor's Degree",
    "location": "Remote"
  }
}
```

**Response (Success - Single Job):**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "job": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Software Engineer",
    "description": "Job description...",
    "rolesAndResponsibilities": "Develop and maintain web applications...",
    "perks": "Health insurance, flexible hours, remote work...",
    "details": "Additional job details and requirements...",
    "jobType": "company",
    "employmentType": "full-time",
    "noOfOpenings": 3,
    "duration": "6 months",
    "mode": "hybrid",
    "stipend": 5000,
    "recruiter": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Smith",
      "email": "john@company.com",
      "designation": "HR Manager",
      "company": {
        "name": "Tech Corp",
        "description": "Leading technology company",
        "industry": "Technology",
        "website": "https://techcorp.com",
        "location": {
          "city": "San Francisco",
          "state": "California",
          "country": "USA"
        },
        "size": "201-500",
        "companyType": "MNC",
        "founded": 2010,
        "logo": "https://cloudinary.com/logo.png"
      }
    },
    "salaryRange": { "min": 50000, "max": 80000 },
    "preferences": {
      "skills": ["JavaScript", "React", "Node.js"],
      "minExperience": 1,
      "education": "Bachelor's Degree",
      "location": "Remote"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Error - Missing Required Fields):**
```json
{
  "success": false,
  "message": "Title, description, and salary range are required"
}
```

**Response (Error - Invalid Employment Type):**
```json
{
  "success": false,
  "message": "Valid employmentType is required (full-time, part-time, contract, internship, freelance)"
}
```

**Response (Error - Invalid Mode):**
```json
{
  "success": false,
  "message": "Valid mode is required (remote, on-site, hybrid)"
}
```

**New Job Fields:**
- `rolesAndResponsibilities`: Detailed role description
- `perks`: Benefits and perks offered
- `details`: Additional job information
- `employmentType`: `full-time`, `part-time`, `contract`, `internship`, `freelance`
- `noOfOpenings`: Number of positions available
- `duration`: Job duration (for contracts/internships)
- `mode`: `remote`, `on-site`, `hybrid`
- `stipend`: Stipend amount (for internships/part-time)

**Request Body (Multiple Jobs):**
```json
[
  {
    "title": "Software Engineer",
    "description": "...",
    "recruiter": "recruiter_id",
    "company": "company_id",
    "salaryRange": { "min": 50000, "max": 80000 }
  },
  {
    "title": "Data Scientist",
    "description": "...",
    "recruiter": "recruiter_id",
    "company": "company_id",
    "salaryRange": { "min": 60000, "max": 90000 }
  }
]
```

### 2. Get All Jobs
**GET** `/jobs/`

**Description:** Get all jobs

**Response (Success):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Software Engineer",
    "description": "We are looking for a skilled software engineer...",
    "rolesAndResponsibilities": "Develop and maintain web applications using modern technologies...",
    "perks": "Health insurance, flexible hours, remote work options...",
    "details": "Must have 2+ years experience in full-stack development...",
    "jobType": "company",
    "employmentType": "full-time",
    "noOfOpenings": 3,
    "duration": "6 months",
    "mode": "hybrid",
    "stipend": 5000,
    "recruiter": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Smith",
      "email": "john@company.com",
      "designation": "HR Manager",
      "company": {
        "name": "Tech Corp",
        "description": "Leading technology company",
        "industry": "Technology",
        "website": "https://techcorp.com",
        "location": {
          "city": "San Francisco",
          "state": "California",
          "country": "USA"
        },
        "size": "201-500",
        "companyType": "MNC",
        "founded": 2010,
        "logo": "https://cloudinary.com/logo.png"
      }
    },
    "salaryRange": { "min": 50000, "max": 80000 },
    "preferences": {
      "skills": ["JavaScript", "React", "Node.js"],
      "minExperience": 1,
      "education": "Bachelor's Degree",
      "location": "Remote"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "title": "Frontend Developer",
    "description": "Join our frontend team...",
    "rolesAndResponsibilities": "Build responsive user interfaces...",
    "perks": "Competitive salary, learning opportunities...",
    "details": "Experience with React and TypeScript required...",
    "jobType": "company",
    "employmentType": "full-time",
    "noOfOpenings": 2,
    "mode": "remote",
    "recruiter": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "Sarah Johnson",
      "email": "sarah@startup.com",
      "designation": "Tech Lead",
      "company": {
        "name": "StartupXYZ",
        "description": "Innovative startup company",
        "industry": "Technology",
        "website": "https://startupxyz.com",
        "location": {
          "city": "New York",
          "state": "New York",
          "country": "USA"
        },
        "size": "11-50",
        "companyType": "Startup",
        "founded": 2020,
        "logo": "https://cloudinary.com/startup-logo.png"
      }
    },
    "salaryRange": { "min": 60000, "max": 90000 },
    "preferences": {
      "skills": ["React", "TypeScript", "CSS"],
      "minExperience": 2,
      "education": "Bachelor's Degree",
      "location": "Remote"
    },
    "createdAt": "2024-01-14T14:20:00.000Z",
    "updatedAt": "2024-01-14T14:20:00.000Z"
  }
]
```

**Response (Error):**
```json
{
  "error": "Database connection failed"
}
```

---

## 📊 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "totalCount": 100,
  "totalPages": 10,
  "currentPage": 1,
  "limit": 10
}
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Technical error details",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_FAILED` - Invalid or missing token
- `AUTHORIZATION_FAILED` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `DUPLICATE_ENTRY` - Resource already exists
- `INTERNAL_ERROR` - Server-side error

---

## 🔧 Authentication Flow

### 1. Frontend gets Firebase token
### 2. Include token in Authorization header
### 3. Backend verifies token using `verifyFirebaseToken` middleware
### 4. Extract user info from token
### 5. Proceed with business logic

### Example Frontend Implementation
```javascript
// Get Firebase token
const token = await user.getIdToken();

// Make authenticated request
const response = await fetch('/api/student/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📝 Notes

1. **All timestamps** are in ISO 8601 format
2. **File uploads** use multipart/form-data
3. **Pagination** is 0-indexed for pages
4. **Search** is case-insensitive
5. **Skills verification** requires passing assessment
6. **Company registration** must happen before recruiter signup
7. **Job applications** are automatically linked to students and jobs
8. **Profile updates** only modify provided fields

---

## 🚀 Getting Started

1. **Register Company** → Get `companyId`
2. **Recruiter Signup** → Use `companyId`
3. **Post Jobs** → Jobs automatically linked to company
4. **Student Signup** → Add skills and education
5. **Apply to Jobs** → Students can apply to posted jobs

This API provides a complete job portal backend with proper relationships between companies, recruiters, students, and jobs!

