🍲 Recipe Finder
A full-stack web application that allows users to search for recipes based on ingredients. This project is integrated with a fully automated CI/CD pipeline using GitHub Actions and deployed to an AWS EC2 instance.

🚀 Features
Search for recipes by ingredient or keyword

Responsive user interface with EJS templating

Node.js backend with optional Python integration

Real-time deployment via GitHub Actions to AWS EC2

Process management with PM2

🛠️ Tech Stack
Component	Technology
Frontend	EJS, CSS, JavaScript
Backend	Node.js, Express
Scripting	Python (optional)
Deployment	AWS EC2, GitHub Actions
Process Manager	PM2
Version Control	Git & GitHub

🏗️ Project Structure
bash
Copy
Edit
recipe-finder/
├── public/               # Static files (CSS, images)
├── views/                # EJS templates
├── routes/               # Express route handlers
├── app.js                # Entry point
├── Dockerfile            # (optional)
├── requirements.txt      # Python dependencies (if any)
└── .github/workflows/    # GitHub Actions CI/CD pipeline
⚙️ CI/CD Workflow
On push to master:

Installs Node & Python dependencies

SSH to EC2

Pulls changes and restarts app with PM2

Example:

yaml
Copy
Edit
on:
  push:
    branches: [master]

jobs:
  build:
    ...
  deploy:
    ...
    steps:
      - name: Deploy to EC2
        run: |
          ssh -i key.pem ec2-user@ec2-host 'cd project && git pull && npm install && pm2 restart all'
Full file in .github/workflows/main.yml

☁️ Deployment
AWS EC2 Setup:

Ubuntu instance with Node.js, Python, Git

SSH key stored in GitHub Secrets

Secrets used:

EC2_HOST

EC2_USER

EC2_PROJECT_DIR

EC2_SSH_KEY

🧪 Running Locally
bash
Copy
Edit
git clone https://github.com/sanjeet789/Recipe-Finder.git
cd Recipe-Finder
npm install
node app.js
Visit http://localhost:3000

🔐 Environment Variables
Create a .env file for secrets or API keys if needed.

📸 Screenshots
Add UI and deployment screenshots here.

🧠 Lessons Learned
GitHub Actions automation

AWS EC2 setup and SSH auth

Managing full-stack deployment

CI/CD troubleshooting and recovery
