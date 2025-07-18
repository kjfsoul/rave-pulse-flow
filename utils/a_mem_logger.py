import functools
from datetime import datetime
import time
from a_mem.store import MemoryStore

# Initialize the MemoryStore for the Mystic Arcana namespace.
# This ensures memory is isolated from other projects like BirthdayGen.
store = MemoryStore(namespace="edm_shuffle")

def log_event(user_id="system", event_type="system_event", payload={}):
    """Directly logs a custom event to the EDM Shuffle memory store."""
    try:
        if not isinstance(payload, dict):
            payload = {"data": str(payload)}

        store.record_event(
            user_id=user_id,
            event_type=event_type,
            payload={**payload, "timestamp_utc": datetime.utcnow().isoformat()}
        )
    except Exception as e:
        print(f"🔥 a_mem_logger Error: Failed to log event. {e}")


def log_invocation(event_type="function_call", user_id="system"):
    """
    Decorator to log a function's invocation, arguments, and execution lifecycle.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            func_name = func.__name__
            
            # Use a combination of args and kwargs for a simple invocation ID
            invocation_id = f"{func_name}_{int(start_time)}"

            # Log the start of the invocation
            log_event(
                user_id=user_id,
                event_type=f"{event_type}_start",
                payload={
                    "invocation_id": invocation_id,
                    "function": func_name,
                    "args": args,
                    "kwargs": kwargs
                }
            )
            
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                log_event(
                    user_id=user_id,
                    event_type=f"{event_type}_success",
                    payload={
                        "invocation_id": invocation_id,
                        "function": func_name,
                        "duration_sec": round(duration, 4),
                        "result_type": str(type(result))
                    }
                )
                return result
            except Exception as e:
                duration = time.time() - start_time
                log_event(
                    user_id=user_id,
                    event_type=f"{event_type}_error",
                    payload={
                        "invocation_id": invocation_id,
                        "function": func_name,
                        "duration_sec": round(duration, 4),
                        "error_type": type(e).__name__,
                        "error_message": str(e)
                    }
                )
                raise
        return wrapper
    return decorator
