import sys
import os
from pprint import pprint

# Add project root to path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from a_mem.store import MemoryStore

def query_latest_events(namespace="edm_shuffle", limit=10):
    """Queries and prints the most recent events from the memory store."""
    print(f"\n--- Querying latest {limit} events from '{namespace}' ---")
    try:
        store = MemoryStore(namespace=namespace)
        events = store.query_events(limit=limit)
        if not events:
            print("No events found.")
            return

        for event in events:
            pprint(event.to_dict())
            print("-" * 20)
            
    except Exception as e:
        print(f"🔥 Error querying memory: {e}")

if __name__ == "__main__":
    query_latest_events()
