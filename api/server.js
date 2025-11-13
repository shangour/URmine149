// This is the backend server code.
// --- Updated to use ES Modules, a more robust database connection pattern, and includes all endpoints ---

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

// --- Environment Variables ---
// These are your secret keys from Vercel's settings
const mongoURI = process.env.MONGO_URI;
const geminiApiKey = process.env.API_KEY;

// --- Mongoose Connection ---
let conn = null;

const connectDatabase = async () => {
  if (conn == null) {
    console.log('Creating new connection to the database...');
    try {
      conn = mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false, // Fail fast if not connected
      }).then(() => mongoose);
      
      await conn;
      console.log('Database connection successful.');
    } catch (error) {
      console.error("!!! DATABASE CONNECTION ERROR !!!");
      console.error("This is likely due to an incorrect MONGO_URI environment variable or your server's IP not being whitelisted in MongoDB Atlas.");
      console.error("Original Error:", error);
      conn = null; // Reset connection
      throw error; // Propagate the error to the route handler
    }
  } else {
    console.log('Reusing existing database connection.');
  }
  return conn;
};


// --- Mongoose Schemas and Models ---
// To avoid "OverwriteModelError" in a serverless environment, we check if the model exists before creating it.
const EmployeeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    currentTaskId: String,
});
const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

const attachmentSchema = new mongoose.Schema({ name: String, type: String, size: Number, data: String });
const phaseSchema = new mongoose.Schema({ name: String, expectedDuration: Number, status: String, validationStatus: String });
const deliverableSchema = new mongoose.Schema({ id: String, type: String, isSubmitted: Boolean });

const TaskSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    ownerId: { type: String, required: true },
    manager: String, mentor: String, expectedDuration: Number, startTime: Number, status: String,
    progressPercentage: Number, currentPhase: String, lastUpdateTime: Number, complianceScore: Number,
    description: String, phases: [phaseSchema], deliverables: [deliverableSchema],
    attachment: attachmentSchema, dueDate: Number,
});
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

const ScreenshotSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    taskId: String,
    employeeId: String,
    timestamp: Number,
    base64Data: String,
});
const Screenshot = mongoose.models.Screenshot || mongoose.model('Screenshot', ScreenshotSchema);

const BlockerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    taskId: String,
    employeeId: String,
    title: String,
    description: String,
    severity: String,
    reportedAt: Number,
    screenshotId: String,
    status: String,
});
const Blocker = mongoose.models.Blocker || mongoose.model('Blocker', BlockerSchema);

const ActivitySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    employeeId: String,
    taskId: String,
    timestamp: Number,
    type: String,
    description: String,
    screenshotId: String,
    metadata: mongoose.Schema.Types.Mixed,
});
const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);


// --- Setup Express App ---
const app = express();
app.use(cors());
// Increase payload limit for file uploads and AI context
app.use(express.json({ limit: '10mb' })); 

// --- API Routes ---
const router = express.Router();

// Middleware to check for required environment variables
router.use((req, res, next) => {
    if (!mongoURI) {
        console.error('MONGO_URI is not set.');
        return res.status(500).json({ message: 'Database connection string is not configured on the server. Please check environment variables.' });
    }
    next();
});

const handleDbError = (err, res) => {
    const isConnectionError = err.message.includes('connect') || err.message.includes('timeout') || err instanceof mongoose.Error.MongooseServerSelectionError;
    if (isConnectionError) {
        return res.status(500).json({ message: 'Database connection failed. Please check server logs and MongoDB Atlas IP Whitelist.' });
    }
    return res.status(500).json({ message: 'An internal server error occurred: ' + err.message });
};

// GET all data
router.get('/tasks', async (req, res) => {
  try {
    await connectDatabase();
    const tasks = await Task.find().sort({ startTime: -1 }); // Sort by most recent
    res.json(tasks);
  } catch (err) {
    handleDbError(err, res);
  }
});

router.get('/employees', async (req, res) => {
  try {
    await connectDatabase();
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    handleDbError(err, res);
  }
});

router.get('/blockers', async (req, res) => {
    try {
        await connectDatabase();
        const blockers = await Blocker.find().sort({ reportedAt: -1 });
        res.json(blockers);
    } catch (err) {
        handleDbError(err, res);
    }
});

router.get('/activities', async (req, res) => {
    try {
        await connectDatabase();
        const activities = await Activity.find().sort({ timestamp: -1 });
        res.json(activities);
    } catch (err) {
        handleDbError(err, res);
    }
});


// POST (Create) routes
router.post('/tasks', async (req, res) => {
  try {
    await connectDatabase();
    // Use a unique ID if not provided, for compatibility with mock data structure
    const taskData = { id: `task-${Date.now()}`, ...req.body };
    const task = new Task(taskData);
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ message: 'Failed to create task: ' + err.message });
    }
    handleDbError(err, res);
  }
});

// Action-specific routes
router.post('/tasks/:id/status-update', async (req, res) => {
    try {
        await connectDatabase();
        const { id: taskId } = req.params;
        const { progressPercentage, activityText, screenshotData } = req.body;
        
        const task = await Task.findOne({ id: taskId });
        if (!task) return res.status(404).send('Task not found');
        
        // 1. Create Screenshot
        const newScreenshotId = `scr-${Date.now()}`;
        const screenshot = new Screenshot({
            id: newScreenshotId,
            taskId,
            employeeId: task.ownerId,
            timestamp: Date.now(),
            base64Data: screenshotData,
        });
        await screenshot.save();
        
        // 2. Create Activity
        const activity = new Activity({
            id: `act-${Date.now()}`,
            employeeId: task.ownerId,
            taskId,
            timestamp: Date.now(),
            type: 'Status Update',
            description: activityText,
            screenshotId: newScreenshotId,
            metadata: { progressPercentage },
        });
        await activity.save();

        // 3. Update Task
        task.progressPercentage = progressPercentage;
        task.lastUpdateTime = Date.now();
        await task.save();

        res.status(200).json({ message: 'Update successful' });

    } catch (err) {
        handleDbError(err, res);
    }
});

router.post('/tasks/:id/blocker-report', async (req, res) => {
    try {
        await connectDatabase();
        const { id: taskId } = req.params;
        const { title, description, severity, screenshotData } = req.body;

        const task = await Task.findOne({ id: taskId });
        if (!task) return res.status(404).send('Task not found');

        const timestamp = Date.now();

        // 1. Create Screenshot
        const newScreenshotId = `scr-${timestamp}`;
        await new Screenshot({
            id: newScreenshotId,
            taskId, employeeId: task.ownerId, timestamp, base64Data: screenshotData,
        }).save();

        // 2. Create Blocker
        await new Blocker({
            id: `blk-${timestamp}`,
            taskId, employeeId: task.ownerId, title, description, severity,
            reportedAt: timestamp,
            screenshotId: newScreenshotId,
            status: 'Open',
        }).save();

        // 3. Create Activity
        await new Activity({
            id: `act-${timestamp}`,
            employeeId: task.ownerId, taskId, timestamp,
            type: 'Blocker Reported',
            description,
            screenshotId: newScreenshotId,
            metadata: { blockerSeverity: severity },
        }).save();

        // 4. Update Task
        task.status = 'Blocked';
        task.lastUpdateTime = timestamp;
        await task.save();

        res.status(200).json({ message: 'Blocker reported successfully' });

    } catch (err) {
        handleDbError(err, res);
    }
});

router.post('/tasks/:id/submit', async (req, res) => {
    try {
        await connectDatabase();
        const { id: taskId } = req.params;

        const task = await Task.findOne({ id: taskId });
        if (!task) return res.status(404).send('Task not found');
        
        const timestamp = Date.now();

        // 1. Create Activity
        await new Activity({
            id: `act-${timestamp}`,
            employeeId: task.ownerId, taskId, timestamp,
            type: 'Task Submitted',
            description: 'Task submitted for review.',
            metadata: { progressPercentage: 100 },
        }).save();

        // 2. Update Task
        task.status = 'Under Review';
        task.progressPercentage = 100;
        task.lastUpdateTime = timestamp;
        await task.save();

        res.status(200).json({ message: 'Task submitted successfully' });

    } catch (err) {
        handleDbError(err, res);
    }
});

// Seed route
router.post('/seed', async (req, res) => {
  try {
    await connectDatabase();
    const { employees, tasks, activities, blockers, screenshots } = req.body;
    // Clear existing data
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await Activity.deleteMany({});
    await Blocker.deleteMany({});
    await Screenshot.deleteMany({});
    // Insert new data
    if (employees) await Employee.insertMany(employees);
    if (tasks) await Task.insertMany(tasks);
    if (activities) await Activity.insertMany(activities);
    if (blockers) await Blocker.insertMany(blockers);
    if (screenshots) await Screenshot.insertMany(screenshots);
    
    res.status(201).send('Database seeded successfully');
  } catch (err) {
    handleDbError(err, res);
  }
});

// --- NEW GEMINI AI ENDPOINT ---
router.post('/generate-briefing', async (req, res) => {
    if (!geminiApiKey) {
        return res.status(500).json({ message: 'Gemini API key is not configured on the server.' });
    }

    try {
        const { tasks, employees, blockers } = req.body;
        
        if (!tasks || !employees) {
            return res.status(400).json({ message: 'Tasks and employees data are required.' });
        }

        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        
        const prompt = `
            You are an expert project management assistant. Your task is to provide a concise, actionable 'Daily Briefing' for a manager based on the provided JSON data. The manager is busy, so be direct and clear. Use Markdown for formatting.

            Here is the current data:
            Tasks: ${JSON.stringify(tasks, null, 2)}
            Employees: ${JSON.stringify(employees, null, 2)}
            Blockers: ${JSON.stringify(blockers, null, 2)}

            Please structure your response in the following sections:

            ### 🚨 Top Priorities

            Highlight 1-3 tasks that require immediate attention. Focus on tasks that are blocked, nearing their due date, or significantly behind schedule. For each task, mention the owner and the reason for its priority.

            ### 👥 Team Pulse

            Provide a brief overview of the team's status. Mention employees who are making good progress and identify anyone who might be struggling or has been idle (no recent updates).

            ### 📈 Potential Risks

            Analyze the data to identify any potential future problems. For example, a series of small delays on a critical path, or an employee with a history of blockers taking on a complex task.

            ### ✅ Actionable Suggestions

            Give the manager 2-3 concrete, actionable steps they should take today. For example: 'Follow up with [Employee Name] about the invalid API key for task [Task Code]' or 'Consider re-allocating [Employee Name] to help with [Task Code] to meet the deadline.'

            Keep the entire briefing under 250 words and do not include the JSON data in your response.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ briefing: response.text });

    } catch (err) {
        console.error('Gemini API Error:', err);
        res.status(500).json({ message: 'Failed to generate briefing from AI model.' });
    }
});


// On Vercel, the rewrite rule in vercel.json handles the /api prefix.
// The function itself receives the path *without* the prefix (e.g., /tasks).
// Therefore, we mount the router at the root of the app.
app.use('/api', router); 

// This line makes the server work on Vercel
export default app;