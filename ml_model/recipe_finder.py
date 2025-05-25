import os
import sys
import json
import pickle
import numpy as np
import re
import warnings
from sklearn.exceptions import InconsistentVersionWarning
from sklearn.metrics.pairwise import cosine_similarity

# Suppress version mismatch warnings
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

# Common ingredient list for extraction
COMMON_INGREDIENTS = [
    'chicken', 'garlic', 'onion', 'tomato', 'potato', 'rice', 'pasta',
    'beef', 'fish', 'oil', 'salt', 'pepper', 'cheese', 'milk', 'butter',
    'flour', 'egg', 'sugar', 'carrot', 'broccoli', 'spinach', 'mushroom',
    'bell pepper', 'lemon', 'lime', 'vinegar', 'soy sauce', 'honey'
]

def extract_ingredients(user_input):
    """Extract ingredients from natural language input"""
    ingredients_found = []
    user_input_lower = user_input.lower()
    
    for ingredient in COMMON_INGREDIENTS:
        if re.search(r'\b' + re.escape(ingredient) + r'\b', user_input_lower):
            ingredients_found.append(ingredient)
    
    return ', '.join(ingredients_found) if ingredients_found else None

def load_model_files():
    """Load the vectorizer and ingredient vectors with specific paths"""
    vectorizer_path = r"/home/ec2-user/Recipe-Finder/ml_model/vectorizer.pkl"
    vectors_path = r"/home/ec2-user/Recipe-Finder/ml_model/ingredient_vectors.pkl"
    
    if not os.path.exists(vectorizer_path):
        raise FileNotFoundError(f"Vectorizer file not found at {vectorizer_path}")
    if not os.path.exists(vectors_path):
        raise FileNotFoundError(f"Ingredient vectors file not found at {vectors_path}")
    
    with open(vectorizer_path, 'rb') as f:
        vectorizer = pickle.load(f)
    
    with open(vectors_path, 'rb') as f:
        ingredient_vectors = pickle.load(f)
    
    return vectorizer, ingredient_vectors

def recommend_recipes(user_input, vectorizer, ingredient_vectors, top_n=10):
    """Generate recipe recommendations based on input ingredients"""
    extracted_ingredients = extract_ingredients(user_input)
    
    if not extracted_ingredients:
        return []
    
    try:
        input_vector = vectorizer.transform([extracted_ingredients])
        similarities = cosine_similarity(input_vector, ingredient_vectors).flatten()
        top_indices = similarities.argsort()[-top_n:][::-1]
        return [int(idx) for idx in top_indices]  # Convert numpy int to Python int
    except Exception as e:
        raise RuntimeError(f"Recommendation error: {str(e)}")

def main():
    try:
        # Load model files from specific paths
        vectorizer, ingredient_vectors = load_model_files()
        
        # Get user input from command line
        if len(sys.argv) < 2:
            raise ValueError("No ingredients provided")
            
        user_input = ' '.join(sys.argv[1:])
        recommendations = recommend_recipes(
            user_input=user_input,
            vectorizer=vectorizer,
            ingredient_vectors=ingredient_vectors
        )
        
        # Output the indices as JSON array
        print(json.dumps(recommendations))
        
    except Exception as e:
        # Return empty array on error
        print(json.dumps([]))
        sys.stderr.write(f"ERROR: {str(e)}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
