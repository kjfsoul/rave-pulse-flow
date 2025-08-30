try:
    import yaml
except ImportError:
    raise ImportError("PyYAML is not installed. Please install it with 'pip install PyYAML'")

from agents.agent_memory import AgentMemory
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

class AgentSessionManager:
    def __init__(self):
        """
        Initializes the session manager by loading configuration and connecting to services.
        """
        # 1. Load and parse config.yaml
        try:
            with open('agents/config.yaml', 'r') as f:
                self.config = yaml.safe_load(f)
        except FileNotFoundError:
            print("Warning: agents/config.yaml not found. Continuing without system-wide settings.")
            self.config = {}

        # 2. Initialize AgentMemory
        self.memory = AgentMemory()
        
        # Initialize Supabase client for task management
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase URL and Key must be set in environment variables.")
        self.supabase_client: Client = create_client(supabase_url, supabase_key)

    def get_next_task(self):
        """
        Connects to Supabase and fetches the next pending task from the 'tasks' table,
        mirroring the logic from the TypeScript getNextPendingTask function.
        """
        try:
            response = self.supabase_client.table('tasks') \
                .select('*') \
                .eq('status', 'pending') \
                .order('priority', desc=True) \
                .limit(1) \
                .execute()
            
            if response.data:
                return response.data[0]
            else:
                return None
        except Exception as e:
            print(f"Error fetching next task: {e}")
            return None

    def prepare_session_for_task(self, task):
        """
        Prepares a session for a given task by retrieving relevant context from memory.
        """
        if not task:
            return None
            
        agent_id = task.get('agent_id')
        if not agent_id:
            # Fallback to a generic agent if not specified in the task
            agent_id = self.config.get('default_agent_id', 'system-knowledge-base')

        task_description = task.get('description', '')
        
        # Retrieve context using the task description as a query
        retrieved_memories = self.memory.retrieve_context(
            agent_id=agent_id,
            query_text=task_description
        )
        
        # Return a complete session context object
        session_context = {
            "task": task,
            "memories": retrieved_memories or []
        }
        
        return session_context
