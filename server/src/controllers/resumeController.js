import Resume from '../models/Resume.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import fs from 'fs';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Environment toggle for AI
const USE_REAL_AI = process.env.USE_REAL_AI === 'true';

let genAI;
let model;
if (USE_REAL_AI) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

function generateMockAnalysis(resumeText, targetRole, jobDescription) {
  const textLower = resumeText.toLowerCase();
  
  const hasExperience = textLower.includes("experience") || textLower.includes("work");
  const hasProjects = textLower.includes("project");
  const hasInternship = textLower.includes("intern") || textLower.includes("internship");
  
  // Determine base score based on user instructions
  let baseScore = 40;
  if (hasExperience && (hasProjects || hasInternship)) {
    baseScore = Math.floor(Math.random() * 10) + 85; // 85-95
  } else if (hasInternship && hasProjects) {
    baseScore = Math.floor(Math.random() * 15) + 70; // 70-85
  } else if (hasProjects) {
    baseScore = Math.floor(Math.random() * 15) + 55; // 55-70
  } else {
    baseScore = Math.floor(Math.random() * 15) + 40; // 40-55
  }

  let strengths = [];
  let weaknesses = [];
  let suggestions = [];

  // Harsh penalties for missing sections/content
  if (!textLower.includes("summary") && !textLower.includes("objective")) {
    weaknesses.push("Missing summary section");
    suggestions.push({ category: "Formatting", text: "Add a professional summary at the top." });
  }

  if (!resumeText.match(/\d+/)) {
    weaknesses.push("No quantified metrics");
    suggestions.push({ category: "Impact", text: "Add quantified metrics (%, $, numbers) to show real impact." });
  } else {
    strengths.push("Includes quantified achievements");
  }
  
  if (!textLower.includes("certification") && !textLower.includes("certificate")) {
    weaknesses.push("No certifications");
    suggestions.push({ category: "Content", text: "Include relevant industry certifications." });
  }

  // Pad suggestions to be 4-5 items
  if (suggestions.length < 4) {
    suggestions.push({ category: "Keywords", text: "Tailor your keywords closer to the target role." });
    suggestions.push({ category: "General", text: "Use strong action verbs to start your bullet points." });
  }
  if (suggestions.length < 5) {
    suggestions.push({ category: "Formatting", text: "Ensure your contact information is clearly visible." });
  }

  const jdMatchedKeywords = jobDescription ? ["JavaScript", "React"] : [];
  const jdMissingKeywords = jobDescription ? ["Docker", "AWS", "CI/CD"] : [];

  return {
    scoreBreakdown: { 
      impact: Math.min(baseScore + Math.floor(Math.random() * 10), 100), 
      formatting: Math.min(baseScore + Math.floor(Math.random() * 10), 100), 
      keywords: Math.min(baseScore - Math.floor(Math.random() * 5), 100), 
      relevance: Math.min(baseScore + Math.floor(Math.random() * 5), 100)
    },
    matchPercentage: jobDescription ? Math.min(baseScore + 5, 100) : baseScore,
    extractedSkills: ["JavaScript", "Node.js", "React", "MongoDB"],
    missingSkills: weaknesses.length ? weaknesses : ["Docker", "AWS", "CI/CD"],
    suggestions: suggestions,
    improvedBullets: [
      { 
        original: "Worked on a web project", 
        improved: "Developed a full-stack web application, increasing user engagement by 20%", 
        reason: "Added quantified metrics" 
      }
    ],
    learningRoadmap: [
      { skill: "Docker", steps: ["Learn container basics", "Build sample project", "Add to resume"] },
      { skill: "AWS", steps: ["Understand EC2 and S3", "Deploy a simple app", "Earn AWS Cloud Practitioner"] }
    ],
    sectionCompleteness: {
      Summary: textLower.includes("summary") || textLower.includes("objective"),
      Experience: textLower.includes("experience") || textLower.includes("work"),
      Education: textLower.includes("education") || textLower.includes("university"),
      Skills: textLower.includes("skills"),
      Projects: textLower.includes("project"),
      Certifications: textLower.includes("certification") || textLower.includes("certificate")
    },
    jdMatchedKeywords,
    jdMissingKeywords
  };
}

// @desc    Upload resume, parse text, and analyze with AI
// @route   POST /api/resume/upload
// @access  Private
export const uploadAndAnalyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const { targetRole, jobDescription } = req.body;

    const dataBuffer = fs.readFileSync(req.file.path);
    
    // Create Hash
    const fileHash = crypto.createHash('md5').update(dataBuffer).digest('hex');

    // 1. Deterministic Caching: Check if identical analysis exists for this user
    const existingResume = await Resume.findOne({
      user: req.user.id,
      fileHash,
      targetRole: targetRole || "General",
      jobDescription: jobDescription || ""
    });

    if (existingResume) {
      fs.unlinkSync(req.file.path);
      return res.status(200).json(existingResume);
    }

    // 2. Extract text from PDF
    const data = await pdfParse(dataBuffer);
    const resumeText = data.text;

    // 3. OpenAI or Mock Logic based on env toggle
    let aiAnalysis;

    if (USE_REAL_AI) {
      const prompt = `You are a STRICT ATS scoring system. 
You must be harsh and realistic.

RESUME CONTENT TO ANALYZE:
${resumeText.substring(0, 4000)}

TARGET ROLE: ${targetRole || 'General'}

For missingKeywords:
- Read the resume carefully
- Only list technologies NOT found in resume
- Must be relevant to target role
- Maximum 5 keywords
- Never repeat keywords found in resume

Return ONLY a valid JSON object with no extra text.
Ensure the JSON matches this structure exactly:
      {
        "extractedSkills": [string],
        "missingSkills": [string],
        "jdMatchedKeywords": [string],
        "jdMissingKeywords": [string],
        "suggestions": [
          { "category": string, "text": string } 
        ],
        "improvedBullets": [ { "original": string, "improved": string, "reason": string } ],
        "learningRoadmap": [
          { "skill": string, "steps": [string, string, string] }
        ],
        "sectionCompleteness": {
          "Summary": boolean,
          "Experience": boolean,
          "Education": boolean,
          "Skills": boolean,
          "Projects": boolean,
          "Certifications": boolean
        }
      }`;

      const fullPrompt = "You are a specialized ATS JSON generator.\\n" + prompt;
      const completion = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      aiAnalysis = JSON.parse(completion.response.text());
    } else {
      aiAnalysis = generateMockAnalysis(resumeText, targetRole, jobDescription);
    }
    
    // Calculate scoreBreakdown in JavaScript
    const resumeTextLower = resumeText.toLowerCase();

    const hasMetrics = /\d+%|\d+ users|\d+ projects|increased|reduced|improved/.test(resumeText);
    const hasInternship = /internship|intern|experience|worked at|employed/.test(resumeTextLower);
    const hasSummary = /summary|objective|profile|about/.test(resumeTextLower);
    const hasCertification = /certification|certified|certificate|course/.test(resumeTextLower);
    const skillCount = aiAnalysis.extractedSkills ? aiAnalysis.extractedSkills.length : 0;
    const hasQuantifiedMetrics = hasMetrics;
    const weakVerbs = /worked on|helped|assisted|participated|was responsible/.test(resumeTextLower);

    let impact = 10;
    if (hasMetrics) impact += 10;
    if (!weakVerbs) impact += 5;

    let formatting = 10;
    if (hasSummary) formatting += 8;
    if (skillCount > 5) formatting += 7;

    let keywords = 5;
    if (skillCount >= 8) keywords = 22;
    else if (skillCount >= 5) keywords = 15;
    else if (skillCount >= 3) keywords = 10;

    let relevance = 10;
    if (hasInternship) relevance += 10;
    if (hasCertification) relevance += 5;

    // Apply deductions
    if (!hasSummary) { impact -= 5; formatting -= 5; }
    if (!hasInternship) relevance -= 8;
    if (!hasCertification) keywords -= 3;
    if (weakVerbs) impact -= 5;
    if (!hasMetrics) impact -= 5;

    // Clamp values
    impact = Math.max(5, Math.min(25, impact));
    formatting = Math.max(5, Math.min(25, formatting));
    keywords = Math.max(5, Math.min(25, keywords));
    relevance = Math.max(5, Math.min(25, relevance));

    const scoreBreakdown = { impact, formatting, keywords, relevance };
    const overallScore = impact + formatting + keywords + relevance;

    // 4. Save to database
    const resume = await Resume.create({
      user: req.user.id,
      filename: req.file.originalname,
      fileHash,
      originalText: resumeText,
      targetRole: targetRole || "General",
      jobDescription: jobDescription || "",
      matchPercentage: overallScore,
      score: overallScore,
      scoreBreakdown: scoreBreakdown,
      extractedSkills: aiAnalysis.extractedSkills,
      missingSkills: aiAnalysis.missingSkills,
      suggestions: aiAnalysis.suggestions,
      improvedBullets: aiAnalysis.improvedBullets,
      learningRoadmap: aiAnalysis.learningRoadmap,
      sectionCompleteness: aiAnalysis.sectionCompleteness,
      jdMatchedKeywords: aiAnalysis.jdMatchedKeywords || [],
      jdMissingKeywords: aiAnalysis.jdMissingKeywords || []
    });

    // Cleanup uploaded file to save space (optional, but good practice if stored in DB)
    fs.unlinkSync(req.file.path);

    res.status(201).json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's resume history
// @route   GET /api/resume/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific resume analysis
// @route   GET /api/resume/:id
// @access  Private
export const getAnalysis = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    
    // Ensure the resume belongs to the logged-in user
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Generate Cover Letter
// @route   POST /api/resume/cover-letter/:id
// @access  Private
export const generateCoverLetter = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { jobTitle, companyName } = req.body;

    if (!jobTitle || !companyName) {
      return res.status(400).json({ message: 'Job title and company name are required' });
    }

    if (USE_REAL_AI) {
      const prompt = `You are a professional cover letter writer. 
      Using this resume data: ${JSON.stringify({
        skills: resume.extractedSkills,
        missingSkills: resume.missingSkills,
        originalText: resume.originalText.substring(0, 3000) // snippet to save tokens
      })}, 
      write a professional, personalized cover letter for the position of ${jobTitle} at ${companyName}. 
      The letter should:
      - Be 3-4 paragraphs
      - Highlight the candidate's strongest skills
      - Mention specific projects from their resume
      - Address missing skills positively
      - Sound human and confident, not robotic
      - End with a strong call to action
      Return only the cover letter text.`;

      const fullPrompt = "You are a professional cover letter generator.\\n\\n" + prompt;
      const result = await model.generateContent(fullPrompt);

      res.json({ coverLetter: result.response.text() });
    } else {
      // Mock response
      const mockLetter = `Dear Hiring Manager at ${companyName},\n\nI am writing to express my strong interest in the ${jobTitle} position. With my background in ${resume.extractedSkills.slice(0,3).join(", ")}, I am confident I can bring immediate value to your team.\n\nWhile I am currently expanding my knowledge in areas like ${resume.missingSkills[0] || 'advanced tools'}, my proven ability to deliver results quickly demonstrates my adaptability.\n\nThank you for considering my application. I look forward to the possibility of discussing this exciting opportunity with you.\n\nSincerely,\n[Your Name]`;
      res.json({ coverLetter: mockLetter });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
