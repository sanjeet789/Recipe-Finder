#  Recipe Finder

A full-stack web application that enables users to discover recipes by entering ingredients or keywords. The project is fully integrated with an automated CI/CD pipeline using GitHub Actions and is deployed on an AWS EC2 instance.


#  Features
Search for recipes by ingredient or keyword

Responsive user interface with EJS templating

Node.js backend with optional Python integration

Real-time deployment via GitHub Actions to AWS EC2

Process management with PM2


#  Tech Stack
Component	Technology
Frontend	EJS, CSS, JavaScript
Backend	Node.js, Express
Scripting	Python (optional)
Deployment	AWS EC2, GitHub Actions
Process Manager	PM2
Version Control	Git & GitHub


#  Project Structure

```text
recipe-finder/
├── public/               # Static files (CSS, images)
├── views/                # EJS templates
├── routes/               # Express route handlers
├── app.js                # Main application entry point
├── Dockerfile            # Docker configuration (optional)
├── requirements.txt      # Python dependencies (if any)
└── .github/
    └── workflows/        # GitHub Actions CI/CD pipeline (main.yml)
``` 
#  CI/CD Workflow
On push to master:

Installs Node & Python dependencies

SSH to EC2

Pulls changes and restarts app with PM2

Example:
```
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
```


#  Deployment
AWS EC2 Setup:

Ubuntu instance with Node.js, Python, Git

SSH key stored in GitHub Secrets

Secrets used:

EC2_HOST

EC2_USER

EC2_PROJECT_DIR

EC2_SSH_KEY




# Running Locally
bash
Copy
Edit
git clone https://github.com/sanjeet789/Recipe-Finder.git
cd Recipe-Finder
npm install
node app.js
Visit http://localhost:3000


# Screenshots
![Screenshot 2025-05-29 115040](https://github.com/user-attachments/assets/debcb936-8e26-4a69-aec4-d67b4de12fc6)
![Screenshot 2025-05-29 115049](https://github.com/user-attachments/assets/88705d2b-3d67-4f53-b5c3-0ea7df558f29)
![Screenshot 2025-05-29 115056](https://github.com/user-attachments/assets/826b2ab2-caf7-408f-8e35-290db8b0fa53)
![Screenshot 2025-05-29 115106](https://github.com/user-attachments/assets/d683a2bc-416f-4628-8f6f-2b3796d3268c)



#  Lessons Learned
GitHub Actions automation

AWS EC2 setup and SSH auth

Managing full-stack deployment

CI/CD troubleshooting and recovery
