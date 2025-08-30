
import os
import glob
import requests
import logging
from dotenv import load_dotenv
from agents.agent_memory import AgentMemory
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables from .env file
load_dotenv()

# --- CONFIGURATION ---
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
AGENT_ID = "system-knowledge-base"
EMBEDDING_MODEL = "text-embedding-ada-002"
API_ENDPOINT = "https://api.openai.com/v1/embeddings"

# --- VALIDATION ---
if not all([OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("Missing required environment variables: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY")

def generate_openai_embedding(text: str) -> list[float]:
    """
    Generates a real embedding for the given text using the OpenAI API.
    """
    # OpenAI's API has a rate limit, so we add a small delay
    time.sleep(0.5) # Adjust as needed
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    
    # Replace newlines to avoid issues with the API
    clean_text = text.replace("\n", " ")
    
    data = {
        "model": EMBEDDING_MODEL,
        "input": clean_text,
    }
    
    try:
        response = requests.post(API_ENDPOINT, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        if "data" in result and len(result["data"]) > 0:
            return result["data"][0]["embedding"]
        else:
            logging.error("API response did not contain expected data structure.")
            return []
            
    except requests.exceptions.RequestException as e:
        logging.error(f"API request failed: {e}")
        return []

def seed_knowledge_base():
    """
    Main function to seed the Supabase table with knowledge from Markdown files.
    """
    logging.info("Starting knowledge base seeding process...")
    
    try:
        memory = AgentMemory()
        logging.info("AgentMemory initialized successfully.")
    except ValueError as e:
        logging.error(f"Failed to initialize AgentMemory: {e}")
        return

    # Override the placeholder embedding function with the real one
    memory.generate_embedding = generate_openai_embedding
    
    # 1. Find all markdown files in the project's root directory
    try:
        markdown_files = glob.glob("*.md")
        if not markdown_files:
            logging.warning("No Markdown files found in the root directory.")
            return
        logging.info(f"Found {len(markdown_files)} Markdown files to process.")
    except Exception as e:
        logging.error(f"Error finding Markdown files: {e}")
        return

    total_chunks_processed = 0
    
    # 2. Iterate through each file
    for md_file in markdown_files:
        logging.info(f"--- Processing file: {md_file} ---")
        try:
            with open(md_file, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except IOError as e:
            logging.error(f"Could not read file {md_file}: {e}")
            continue

        # 3. Split content into logical chunks (by paragraph)
        chunks = [chunk.strip() for chunk in content.split("\n\n") if chunk.strip()]
        
        if not chunks:
            logging.warning(f"No content chunks found in {md_file}.")
            continue
            
        logging.info(f"Found {len(chunks)} chunks in {md_file}.")

        # 4. For each chunk, generate embedding and store it
        for i, chunk in enumerate(chunks):
            try:
                logging.info(f"Storing chunk {i+1}/{len(chunks)} from {md_file}...")
                # The add_context method now uses our real embedding function
                response = memory.add_context(
                    agent_id=AGENT_ID,
                    context=chunk
                )
                
                # Check response from Supabase
                if hasattr(response, 'error') and response.error:
                    logging.error(f"Supabase error for chunk {i+1}: {response.error}")
                else:
                    total_chunks_processed += 1
                    logging.info(f"Successfully stored chunk {i+1}.")

            except Exception as e:
                logging.error(f"Error processing chunk {i+1} from {md_file}: {e}")

    logging.info(f"\n--- Seeding Complete ---")
    logging.info(f"Total chunks successfully processed and stored: {total_chunks_processed}")

if __name__ == "__main__":
    seed_knowledge_base()
