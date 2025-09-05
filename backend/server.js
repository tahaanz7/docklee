const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 
const os = require('os');


// app instance
const app = express();
const PORT = 3000;
const { exec } = require('child_process');

// Middleware to parse JSON bodies
app.use(express.json());

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
