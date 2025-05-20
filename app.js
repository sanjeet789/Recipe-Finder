require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Load recipes data (without image handling)
let recipes = [];
fs.createReadStream(path.join(__dirname, 'data', 'Food Ingredients and Recipe Dataset with Image Name Mapping.csv'))
  .pipe(csv())
  .on('data', (row) => recipes.push(row))
  .on('end', () => {
    console.log('Recipes data loaded');
  });

// Load users data
let users = [];
try {
  const usersData = fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8');
  users = JSON.parse(usersData);
  console.log('Users data loaded');
} catch (err) {
  console.log('No users file found, starting with empty users array');
  fs.writeFileSync(path.join(__dirname, 'data', 'users.json'), '[]');
}

// Helper functions
function saveUsers() {
  fs.writeFileSync(path.join(__dirname, 'data', 'users.json'), JSON.stringify(users, null, 2));
}

function getFavorites(userId) {
  const user = users.find(u => u.id === userId);
  return user ? user.favorites || [] : [];
}

function toggleFavorite(userId, recipeId) {
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  
  if (!user.favorites) user.favorites = [];
  
  const index = user.favorites.indexOf(recipeId);
  if (index === -1) {
    user.favorites.push(recipeId);
  } else {
    user.favorites.splice(index, 1);
  }
  
  saveUsers();
  return true;
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    user: req.session.user || null,
    error: null 
  });
});

// Auth Routes
app.get('/login', (req, res) => {
  res.render('auth/login', { 
    user: req.session.user || null,
    error: null 
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.render('auth/login', { 
      user: null,
      error: 'Invalid email or password' 
    });
  }
});

app.get('/register', (req, res) => {
  res.render('auth/register', { 
    user: req.session.user || null,
    error: null 
  });
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.render('auth/register', { 
      user: null,
      error: 'All fields are required' 
    });
  }
  
  if (users.some(u => u.email === email)) {
    return res.render('auth/register', { 
      user: null,
      error: 'Email already registered' 
    });
  }
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    favorites: []
  };
  
  users.push(newUser);
  saveUsers();
  
  req.session.user = newUser;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Recipe Routes
app.get('/search', (req, res) => {
  res.render('recipes/search', { 
    user: req.session.user || null,
    results: null, 
    query: null,
    error: null
  });
});

app.post('/search', (req, res) => {
  const query = req.body.query;
  
  if (!query) {
    return res.render('recipes/search', { 
      user: req.session.user || null,
      results: null, 
      query: null,
      error: 'Please enter a search term'
    });
  }
  
  const pythonProcess = spawn('python', [
    path.join(__dirname, 'ml_model', 'recipe_finder.py'),
    query
  ]);
  
  let output = '';
  let errorOutput = '';
  
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0 || errorOutput) {
      console.error('Python error:', errorOutput);
      return res.render('recipes/search', { 
        user: req.session.user || null,
        results: null, 
        query,
        error: 'Error processing your search. Please try different ingredients.'
      });
    }
    
    try {
      const recipeIndices = JSON.parse(output);
      const results = recipeIndices.map(index => ({
        ...recipes[index],
        id: index
      }));
      
      res.render('recipes/search', { 
        user: req.session.user || null,
        results,
        query,
        error: null
      });
    } catch (err) {
      console.error('Error parsing search results:', err);
      res.render('recipes/search', { 
        user: req.session.user || null,
        results: null, 
        query,
        error: 'Error processing results. Please try again.'
      });
    }
  });
});

app.get('/recipe/:id', (req, res) => {
  const recipeId = parseInt(req.params.id);
  const recipe = recipes[recipeId];
  
  if (!recipe) {
    return res.status(404).send('Recipe not found');
  }
  
  const isFavorite = req.session.user && 
    users.find(u => u.id === req.session.user.id)?.favorites?.includes(recipeId);
  
  res.render('recipes/details', { 
    user: req.session.user || null,
    recipe,
    recipeId,
    isFavorite,
    error: null
  });
});

app.post('/recipe/:id/toggle-favorite', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  const recipeId = parseInt(req.params.id);
  toggleFavorite(req.session.user.id, recipeId);
  
  res.redirect(`/recipe/${recipeId}`);
});

app.get('/favorites', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  const user = users.find(u => u.id === req.session.user.id);
  const favoriteRecipes = (user.favorites || []).map(id => ({
    ...recipes[id],
    id
  }));
  
  res.render('recipes/favorites', { 
    user: req.session.user || null,
    favorites: favoriteRecipes,
    error: null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});