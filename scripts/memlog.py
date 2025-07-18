import sys
import subprocess
import os

# Add the project root to the Python path to find the logger module
# This assumes the script is in project_root/mystic_arcana/scripts/
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(project_root)

from edm_shuffle.utils.a_mem_logger import log_event

def main():
    """
    Executes a shell command and logs its invocation and result to the memory store.
    """
    if len(sys.argv) < 2:
        print("Usage: memlog <your_command_here>")
        sys.exit(1)

    command = sys.argv[1:]
    command_str = " ".join(command)
    
    # Log the command before execution
    print(f" M_LOG -> {command_str}")
    log_event(
        user_id="dev_cli",
        event_type="command_run",
        payload={"command": command_str}
    )
    
    try:
        # Execute the command and stream its output
        process = subprocess.run(command, check=True)
        
        # Log success
        log_event(
            user_id="dev_cli",
            event_type="command_success",
            payload={"command": command_str, "exit_code": process.returncode}
        )
    except subprocess.CalledProcessError as e:
        # Log failure
        log_event(
            user_id="dev_cli",
            event_type="command_error",
            payload={
                "command": command_str,
                "exit_code": e.returncode,
                "stderr": e.stderr if e.stderr else ""
            }
        )
        # Exit with the same code as the failed command
        sys.exit(e.returncode)
    except FileNotFoundError:
        print(f"🔥 memlog Error: Command not found -> {command[0]}")
        sys.exit(127)

if __name__ == "__main__":
    main()
