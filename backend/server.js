const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 
const os = require('os');
import cors from 'cors'


// app instance
const app = express();
const PORT = 3000;
const { exec } = require('child_process');

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors())

// Allow all origins 
//app.use(cors())

// onfigure specific origins
app.use(cors({
  origin: 'http://localhost:5173', // your Vue dev server URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // if you’re using cookies/auth
}))

// Simple auth middleware
function authMiddleware(req, res, next) {
  const { user, pass } = req.headers;

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    next(); // allowed
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Route to list apps from /templates
app.get('/apps', (req, res) => {
  const templatesDir = path.join(__dirname, '../templates');
  const apps = [];

  fs.readdirSync(templatesDir).forEach(folder => {
    const metadataPath = path.join(templatesDir, folder, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      apps.push(metadata);
    }
  });

  res.json(apps);
});

// Install an app
app.post('/install/:appName', (req, res) => {
  const appName = req.params.appName;

  // Path to user's docklee-apps folder
  const userAppsDir = path.join(os.homedir(), 'docklee-apps');
  const targetDir = path.join(userAppsDir, appName);
  const composeFile = path.join(targetDir, 'docker-compose.yml');

  // Make sure ~/docklee-apps exists
  if (!fs.existsSync(userAppsDir)) fs.mkdirSync(userAppsDir);

  // Path to template
  const localCompose = path.join(__dirname, `../templates/${appName}/docker-compose.yml`);

  if (!fs.existsSync(localCompose)) {
    return res.status(404).json({ error: "App not found in templates" });
  }

  // Make sure app folder exists and copy compose file
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);
  fs.copyFileSync(localCompose, composeFile);

  // Run docker compose from the copied file
  exec(`docker compose -f ${composeFile} up -d`, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: "Failed to install app" });
    }
    res.json({ message: `${appName} installed successfully!`, output: stdout });
  });
});

// Installed apps

app.get('/installed',(req,res)=>{
  const userAppsDir = path.join(os.homedir(), 'docklee-apps');
  const installedApps = [];

  if(fs.existsSync(userAppsDir)){
    fs.readdirSync(userAppsDir).forEach(folder=>{
    const dockerComposeFile = path.join(userAppsDir,folder, 'docker-compose.yml' )
    if(fs.existsSync(dockerComposeFile)){
      
      installedApps.push({name: folder});
      
    }
  })
  }
  res.json(installedApps);
})

// Uninstall apps
app.post('/uninstall/:appName', (req, res)=>{

  const appName = req.params.appName;
  const userAppsDir = path.join(os.homedir(), 'docklee-apps');
  const appPath = path.join(userAppsDir, appName,'docker-compose.yml');

  if(fs.existsSync(appPath)){
    // Run docker compose from the copied file
  exec(`docker compose -f ${appPath} down`, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: "Failed to uninstall app" });
    }
    res.json({ message: `${appName} uninstalled successfully!`, output: stdout });
  });
  }else {
  return res.status(404).json({ error: "App not found" });
}
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
