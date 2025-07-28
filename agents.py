"""
EDM Shuffle CrewAI Agents Module

This module defines 10 specialized CrewAI agents for festival scoping, virtual environments,
DJ mixing, fashion, gamification, analytics, automation, and QA.

Each agent has:
- Role: Specific responsibility area
- Goal: What they aim to accomplish
- Backstory: Context and expertise background
- Tools: Specialized capabilities for their domain

IMPORTANT: This follows CLAUDE_INTEGRITY_RULES.md - no fabricated progress claims.
All tool integrations are marked as TODO where actual implementation is needed.
"""

from crewai import Agent
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

# Import tools dynamically to handle version compatibility
try:
    from crewai_tools import BaseTool, WebScrapeTool, FileReadTool, DirectoryReadTool
except ImportError:
    # Fallback for older versions or missing tools
    BaseTool = object
    WebScrapeTool = None
    FileReadTool = None 
    DirectoryReadTool = None
    print("⚠️ CrewAI tools not available - using basic implementation")

# Import custom tools (handle import errors gracefully)
try:
    from tools import get_tools_for_agent, get_all_tools
except ImportError:
    print("⚠️ Custom tools module not available - agents will use basic tools only")
    def get_tools_for_agent(role): return []
    def get_all_tools(): return {}

# Load environment variables
load_dotenv()

def create_base_agent(role: str, goal: str, backstory: str, tools: List[BaseTool] = None, **kwargs) -> Agent:
    """
    Factory function to create base CrewAI agents with consistent configuration.
    
    Args:
        role: Agent's role/title
        goal: What the agent aims to accomplish
        backstory: Context and expertise background
        tools: List of tools the agent can use
        **kwargs: Additional agent configuration
    
    Returns:
        Configured CrewAI Agent instance
    """
    return Agent(
        role=role,
        goal=goal,
        backstory=backstory,
        tools=tools or [],
        verbose=True,
        allow_delegation=False,
        **kwargs
    )

# =============================================================================
# AGENT DEFINITIONS
# =============================================================================

def create_festival_scouter() -> Agent:
    """
    Festival Scouter Agent - Discovers and aggregates global EDM festival data
    """
    # Get specialized tools for this agent
    custom_tools = get_tools_for_agent("Festival Scouter")
    
    # Add standard CrewAI tools if available
    tools = custom_tools.copy()
    if WebScrapeTool:
        tools.append(WebScrapeTool())
    if FileReadTool:
        tools.append(FileReadTool())
    
    return create_base_agent(
        role="Festival Scouter",
        goal="Discover emerging and established EDM festivals worldwide, aggregate event details, and update the platform's RSS feed",
        backstory="A world-traveling EDM aficionado who has attended over 100 festivals on five continents. You map the global scene using industry contacts and live feeds to ensure no event goes unnoticed.",
        tools=tools
    )

def create_virtual_festival_architect() -> Agent:
    """
    Virtual Festival Architect - Designs 3D festival environments
    """
    # Get specialized tools for this agent
    custom_tools = get_tools_for_agent("Virtual Festival Architect")
    
    # Add standard CrewAI tools if available
    tools = custom_tools.copy()
    if DirectoryReadTool:
        tools.append(DirectoryReadTool())
    if FileReadTool:
        tools.append(FileReadTool())
    
    return create_base_agent(
        role="Virtual Festival Architect", 
        goal="Design immersive 3D festival environments and stage layouts for virtual rave experiences using WebGL and Unity",
        backstory="A multidisciplinary 3D artist and real-time graphics engineer who built Tomorrowland's Around the World digital stage. You blend art and tech to recreate festival magic online.",
        tools=tools
    )

def create_shuffle_coach() -> Agent:
    """
    Shuffle Coach Agent - Creates dance tutorials and training content
    """
    # Get specialized tools for this agent
    custom_tools = get_tools_for_agent("Shuffle Coach")
    
    # Add standard CrewAI tools if available
    tools = custom_tools.copy()
    if FileReadTool:
        tools.append(FileReadTool())
    
    return create_base_agent(
        role="Shuffle Coach",
        goal="Curate and generate shuffle dance tutorials, step progressions, and personalized training plans including video content and interactive feedback",
        backstory="A former pro shuffle dancer turned educator with a library of moves from Melbourne and Cutting Shapes styles. You translate complex footwork into beginner-friendly lessons.",
        tools=tools
    )

def create_beat_mixer() -> Agent:
    """
    Beat Mixer Agent - Creates DJ mixes and audio content
    """
    # Get specialized tools for this agent
    custom_tools = get_tools_for_agent("Beat Mixer and Remix Creator")
    
    # Add standard CrewAI tools if available
    tools = custom_tools.copy()
    if FileReadTool:
        tools.append(FileReadTool())
    if DirectoryReadTool:
        tools.append(DirectoryReadTool())
    
    return create_base_agent(
        role="Beat Mixer and Remix Creator",
        goal="Generate DJ-style stems, mashups, and remixes using AI-driven audio tools, optimizing transitions for dancefloor energy",
        backstory="An AI music producer who cut your teeth on Ableton and neural audio synthesis. You understand the ebb and flow of festival sets and craft perfect peak-hour drops.",
        tools=tools
    )

def create_lineup_curator() -> Agent:
    """
    Lineup Curator Agent - Recommends artist lineups based on data analytics
    """
    # TODO: Implement SpotifyAnalyticsTool for streaming data
    # TODO: Implement SocialMediaTool for buzz analysis
    tools = [
        # SpotifyAnalyticsTool(),  # Custom tool for music analytics
        # SocialMediaTool(),       # Custom tool for social sentiment
        WebScrapeTool(),          # For scraping music platform data
    ]
    
    return create_base_agent(
        role="Lineup Curator",
        goal="Recommend artist lineups based on festival theme, audience preferences, and emerging talent analytics",
        backstory="A veteran A&R scout turned data scientist. You analyze streaming metrics, social buzz, and crowd sentiment to craft lineups that keep crowds engaged.",
        tools=tools
    )

def create_fashion_futurist() -> Agent:
    """
    Fashion Futurist Agent - Manages marketplace and fashion recommendations
    """
    # Get specialized tools for this agent
    custom_tools = get_tools_for_agent("EDM Fashion Designer and Marketplace Specialist")
    
    # Add standard CrewAI tools if available
    tools = custom_tools.copy()
    if FileReadTool:
        tools.append(FileReadTool())
    if DirectoryReadTool:
        tools.append(DirectoryReadTool())
    
    return create_base_agent(
        role="EDM Fashion Designer and Marketplace Specialist",
        goal="Design and recommend festival-ready outfits and gear, manage digital marketplace listings, and integrate NFT wearables",
        backstory="A trendsetting rave couturier who has styled headliners and created blockchain-backed festival fashion drops. You merge functionality with show-stopping aesthetics.",
        tools=tools
    )

def create_engagement_alchemist() -> Agent:
    """
    Engagement Alchemist Agent - Develops gamification and social features
    """
    # Get specialized tools for this agent
    custom_tools = get_tools_for_agent("Community Engagement and Gamification Specialist")
    
    # Add standard CrewAI tools if available
    tools = custom_tools.copy()
    if FileReadTool:
        tools.append(FileReadTool())
    if DirectoryReadTool:
        tools.append(DirectoryReadTool())
    
    return create_base_agent(
        role="Community Engagement and Gamification Specialist",
        goal="Develop interactive mini-games, challenges, and social features (e.g., avatar dance-offs) to boost user retention and virality",
        backstory="A gamification expert who fused casual gaming mechanics into festival apps. You specialize in crafting shareable dance-battle experiences that go viral.",
        tools=tools
    )

def create_data_oracle() -> Agent:
    """
    Data Oracle Agent - Handles analytics and business intelligence
    """
    # Get specialized tools for this agent
    custom_tools = get_tools_for_agent("Analytics Architect")
    
    # Add standard CrewAI tools if available
    tools = custom_tools.copy()
    if FileReadTool:
        tools.append(FileReadTool())
    if DirectoryReadTool:
        tools.append(DirectoryReadTool())
    
    return create_base_agent(
        role="Analytics Architect",
        goal="Design dashboards and analytics pipelines tracking user behavior, festival metrics, and content performance for continuous optimization",
        backstory="A BI veteran and data engineer who built real-time dashboards for major music brands. You turn clickstreams and vote data into actionable insights.",
        tools=tools
    )

def create_automation_maestro() -> Agent:
    """
    Automation Maestro Agent - Handles notifications and workflow automation
    """
    # TODO: Implement NotificationTool for push notifications
    # TODO: Implement SchedulerTool for time-based automation
    tools = [
        # NotificationTool(),  # Custom tool for push notifications
        # SchedulerTool(),     # Custom tool for scheduling
        FileReadTool(),       # For reading automation configs
    ]
    
    return create_base_agent(
        role="Automation Engineer",
        goal="Implement event reminders, lineup announcements, and personalized push notifications without spamming users",
        backstory="An automation specialist who scaled global newsletter campaigns and time-zone–aware alerts for live events. You balance timely updates with user comfort.",
        tools=tools
    )

def create_quality_guardian() -> Agent:
    """
    Quality Guardian Agent - Handles QA, testing, and ethical oversight
    """
    # TODO: Implement TestingTool for automated QA
    # TODO: Implement AccessibilityTool for inclusive design
    tools = [
        # TestingTool(),        # Custom tool for automated testing
        # AccessibilityTool(),  # Custom tool for accessibility checks
        FileReadTool(),        # For reading test cases and guidelines
        DirectoryReadTool(),   # For code review and analysis
    ]
    
    return create_base_agent(
        role="Quality Assurance and Ethical Oversight",
        goal="Test all features (UI, audio, video tutorials, automations) for functionality, performance, and inclusivity, ensuring safe and respectful experiences",
        backstory="A QA lead with a background in accessibility and digital ethics. You catch technical bugs and guard against cultural insensitivity, bias, or exploitative content.",
        tools=tools
    )

# =============================================================================
# AGENT REGISTRY
# =============================================================================

def get_all_agents() -> Dict[str, Agent]:
    """
    Returns a dictionary of all available agents for the EDM Shuffle platform.
    
    Returns:
        Dictionary mapping agent names to Agent instances
    """
    return {
        "festival_scouter": create_festival_scouter(),
        "virtual_festival_architect": create_virtual_festival_architect(), 
        "shuffle_coach": create_shuffle_coach(),
        "beat_mixer": create_beat_mixer(),
        "lineup_curator": create_lineup_curator(),
        "fashion_futurist": create_fashion_futurist(),
        "engagement_alchemist": create_engagement_alchemist(),
        "data_oracle": create_data_oracle(),
        "automation_maestro": create_automation_maestro(),
        "quality_guardian": create_quality_guardian()
    }

def get_agent_by_name(name: str) -> Agent:
    """
    Retrieve a specific agent by name.
    
    Args:
        name: Agent name (e.g., 'festival_scouter')
        
    Returns:
        Agent instance
        
    Raises:
        KeyError: If agent name not found
    """
    agents = get_all_agents()
    if name not in agents:
        raise KeyError(f"Agent '{name}' not found. Available agents: {list(agents.keys())}")
    return agents[name]

# =============================================================================
# MAIN EXECUTION
# =============================================================================

if __name__ == "__main__":
    """
    Demo script to verify agent creation and display agent information.
    """
    print("🎵 EDM Shuffle CrewAI Agents Initialization 🎵")
    print("=" * 50)
    
    agents = get_all_agents()
    
    for name, agent in agents.items():
        print(f"\n🤖 {agent.role}")
        print(f"Goal: {agent.goal}")
        print(f"Tools: {len(agent.tools)} configured")
        print("-" * 30)
    
    print(f"\n✅ Successfully initialized {len(agents)} agents")
    print("Ready for crew orchestration!")