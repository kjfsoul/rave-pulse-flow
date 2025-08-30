from session_manager import AgentSessionManager
from crewai import Agent, Task, Crew, Process
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    """
    Main orchestrator for the unified agent system.
    """
    logging.info("Initializing Agent Session Manager...")
    try:
        manager = AgentSessionManager()
    except (ImportError, ValueError) as e:
        logging.error(f"Failed to initialize session manager: {e}")
        return

    logging.info("Fetching the next available task...")
    task_data = manager.get_next_task()

    if not task_data:
        logging.info("No pending tasks found. Exiting.")
        return

    task_id = task_data.get('id')
    logging.info(f"Found task: {task_id} - {task_data.get('description')[:50]}...")

    logging.info("Preparing session context for the task...")
    session_context = manager.prepare_session_for_task(task_data)

    if not session_context:
        logging.error("Failed to prepare session for the task.")
        # Optionally, update task status to 'failed' here
        return

    task = session_context['task']
    memories = session_context['memories']
    
    # Combine memories into a string for the agent's context
    context_str = "\n".join([item['context'] for item in memories]) if memories else "No relevant context found in memory."
    
    # 5. Dynamically instantiate the agent based on task requirements
    logging.info("Dynamically instantiating agent...")
    agent_role = task.get('agent_role', 'Generic Task Agent')
    agent_goal = task.get('agent_goal', 'Process the assigned task based on the provided context and instructions.')
    agent_backstory = f"### RELEVANT CONTEXT FROM MEMORY ###\n{context_str}\n\n### ORIGINAL AGENT BACKSTORY ###\n{task.get('agent_backstory', 'You are an AI assistant designed to complete tasks efficiently.')}"

    agent = Agent(
        role=agent_role,
        goal=agent_goal,
        backstory=agent_backstory,
        verbose=True,
        allow_delegation=False, # As per old system, can be configured from task data
    )

    # Create a CrewAI task for execution
    crew_task = Task(
        description=task['description'],
        expected_output=task.get('expected_output', 'A detailed report of the task execution and results.'),
        agent=agent
    )

    # 6. Execute the agent's task
    logging.info(f"Executing task {task_id} with agent {agent.role}...")
    crew = Crew(
        agents=[agent],
        tasks=[crew_task],
        process=Process.sequential,
        verbose=True
    )
    result = crew.kickoff()

    # 7. Store the result back into the database
    logging.info(f"Task {task_id} completed. Storing result in memory...")
    agent_id = task.get('agent_id', manager.config.get('default_agent_id', 'system-knowledge-base'))
    manager.memory.add_context(agent_id, result)
    
    # Update the task status to 'completed' in Supabase
    try:
        manager.supabase_client.table('tasks').update({'status': 'completed', 'result': result}).eq('id', task['id']).execute()
        logging.info(f"Successfully updated task {task_id} status to 'completed'.")
    except Exception as e:
        logging.error(f"Failed to update task {task_id} status: {e}")

    logging.info("Orchestration cycle complete.")

if __name__ == "__main__":
    main()
