2import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class AgentMemory:
    """
    Integrates with a Supabase backend to store and retrieve context for agents
    using vector embeddings and a remote procedure call (RPC).
    """

    def __init__(self):
        """
        Initializes the Supabase client.
        Requires SUPABASE_URL and SUPABASE_KEY to be set as environment variables.
        """
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")

        if not supabase_url or not supabase_key:
            raise ValueError("Supabase environment variables SUPABASE_URL and SUPABASE_KEY are required.")

        self.client: Client = create_client(supabase_url, supabase_key)

    def generate_embedding(self, text: str) -> list[float]:
        """
        Generates a placeholder embedding for the given text.

        # TODO: Integrate a real embedding model like OpenAI's text-embedding-ada-002.
        """
        # This is a placeholder. A real implementation would call an embedding service.
        # The size 1536 corresponds to OpenAI's text-embedding-ada-002 model.
        return [0.0] * 1536

    def add_context(self, agent_id: str, context: str):
        """
        Stores a new context for a specific agent in the 'agent_contexts' table.

        Args:
            agent_id: The ID of the agent.
            context: The text context to store.

        Returns:
            The API response from the insert operation.
        """
        embedding = self.generate_embedding(context)
        data = {
            "agent_id": agent_id,
            "context": context,
            "embedding": embedding
        }
        response = self.client.table("agent_contexts").insert(data).execute()
        return response

    def retrieve_context(self, agent_id: str, query_text: str, match_threshold: float = 0.7, match_count: int = 5):
        """
        Retrieves relevant contexts for an agent by calling the 'match_agent_contexts' RPC function.

        Args:
            agent_id: The ID of the agent.
            query_text: The query text to find matching contexts for.
            match_threshold: The minimum similarity score for a match.
            match_count: The maximum number of contexts to return.

        Returns:
            The data returned by the RPC call, which should be a list of matching contexts.
        """
        query_embedding = self.generate_embedding(query_text)
        params = {
            "agent_id_param": agent_id,
            "query_embedding": query_embedding,
            "match_threshold": match_threshold,
            "match_count": match_count
        }
        response = self.client.rpc("match_agent_contexts", params).execute()
        return response.data
