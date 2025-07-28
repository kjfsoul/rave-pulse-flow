"""
EDM Shuffle CrewAI Agents Module - Production Ready Version

This module defines 10 specialized CrewAI agents for festival scoping, virtual environments,
DJ mixing, fashion, gamification, analytics, automation, and QA.

IMPORTANT: This follows CLAUDE_INTEGRITY_RULES.md - no fabricated progress claims.
All tool integrations are marked with TODO comments where implementation is needed.
"""

from crewai import Agent
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_base_agent(role: str, goal: str, backstory: str, tools: List[Any] = None, **kwargs) -> Agent:
    """
    Factory function to create base CrewAI agents with consistent configuration.
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
    """Festival Scouter Agent - Discovers and aggregates global EDM festival data"""
    return create_base_agent(
        role="Festival Scouter",
        goal="Discover emerging and established EDM festivals worldwide, aggregate event details, and update the platform's RSS feed",
        backstory="A world-traveling EDM aficionado who has attended over 100 festivals on five continents. You map the global scene using industry contacts and live feeds to ensure no event goes unnoticed.",
        tools=[]  # TODO: Add custom tools when implemented
    )

def create_virtual_festival_architect() -> Agent:
    """Virtual Festival Architect - Designs 3D festival environments"""
    return create_base_agent(
        role="Virtual Festival Architect", 
        goal="Design immersive 3D festival environments and stage layouts for virtual rave experiences using WebGL and Unity",
        backstory="A multidisciplinary 3D artist and real-time graphics engineer who built Tomorrowland's Around the World digital stage. You blend art and tech to recreate festival magic online.",
        tools=[]  # TODO: Add custom tools when implemented
    )

def create_shuffle_coach() -> Agent:
    """Shuffle Coach Agent - Creates dance tutorials and training content"""
    return create_base_agent(
        role="Shuffle Coach",
        goal="Curate and generate shuffle dance tutorials, step progressions, and personalized training plans including video content and interactive feedback",
        backstory="A former pro shuffle dancer turned educator with a library of moves from Melbourne and Cutting Shapes styles. You translate complex footwork into beginner-friendly lessons.",
        tools=[]  # TODO: Add custom tools when implemented
    )

def create_beat_mixer() -> Agent:
    """Beat Mixer Agent - Creates DJ mixes and audio content"""
    return create_base_agent(
        role="Beat Mixer and Remix Creator",
        goal="Generate DJ-style stems, mashups, and remixes using AI-driven audio tools, optimizing transitions for dancefloor energy",
        backstory="An AI music producer who cut your teeth on Ableton and neural audio synthesis. You understand the ebb and flow of festival sets and craft perfect peak-hour drops.",
        tools=[]  # TODO: Add custom tools when implemented
    )

def create_lineup_curator() -> Agent:
    """Lineup Curator Agent - Recommends artist lineups based on data analytics"""
    return create_base_agent(
        role="Lineup Curator",
        goal="Recommend artist lineups based on festival theme, audience preferences, and emerging talent analytics",
        backstory="A veteran A&R scout turned data scientist. You analyze streaming metrics, social buzz, and crowd sentiment to craft lineups that keep crowds engaged.",
        tools=[]  # TODO: Add custom tools when implemented
    )

def create_fashion_futurist() -> Agent:
    """Fashion Futurist Agent - Manages marketplace and fashion recommendations"""
    return create_base_agent(
        role="EDM Fashion Designer and Marketplace Specialist",
        goal="Design and recommend festival-ready outfits and gear, manage digital marketplace listings, and integrate NFT wearables",
        backstory="A trendsetting rave couturier who has styled headliners and created blockchain-backed festival fashion drops. You merge functionality with show-stopping aesthetics.",
        tools=[]  # TODO: Add custom tools when implemented
    )

def create_engagement_alchemist() -> Agent:
    """Engagement Alchemist Agent - Develops gamification and social features"""
    return create_base_agent(
        role="Community Engagement and Gamification Specialist",
        goal="Develop interactive mini-games, challenges, and social features (e.g., avatar dance-offs) to boost user retention and virality",
        backstory="A gamification expert who fused casual gaming mechanics into festival apps. You specialize in crafting shareable dance-battle experiences that go viral.",
        tools=[]  # TODO: Add custom tools when implemented
    )

def create_data_oracle() -> Agent:
    """Data Oracle Agent - Handles analytics and business intelligence"""
    return create_base_agent(
        role="Analytics Architect",
        goal="Design dashboards and analytics pipelines tracking user behavior, festival metrics, and content performance for continuous optimization",
        backstory="A BI veteran and data engineer who built real-time dashboards for major music brands. You turn clickstreams and vote data into actionable insights.",
        tools=[]  # TODO: Add custom tools when implemented
    )

def create_automation_maestro() -> Agent:
    """Automation Maestro Agent - Handles notifications and workflow automation"""
    return create_base_agent(
        role="Automation Engineer",
        goal="Implement event reminders, lineup announcements, and personalized push notifications without spamming users",
        backstory="An automation specialist who scaled global newsletter campaigns and time-zone–aware alerts for live events. You balance timely updates with user comfort.",
        tools=[]  # TODO: Add custom tools when implemented
    )

def create_quality_guardian() -> Agent:
    """Quality Guardian Agent - Handles QA, testing, and ethical oversight"""
    return create_base_agent(
        role="Quality Assurance and Ethical Oversight",
        goal="Test all features (UI, audio, video tutorials, automations) for functionality, performance, and inclusivity, ensuring safe and respectful experiences",
        backstory="A QA lead with a background in accessibility and digital ethics. You catch technical bugs and guard against cultural insensitivity, bias, or exploitative content.",
        tools=[]  # TODO: Add custom tools when implemented
    )

# =============================================================================
# AGENT REGISTRY
# =============================================================================

def get_all_agents() -> Dict[str, Agent]:
    """Returns a dictionary of all available agents for the EDM Shuffle platform."""
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
    """Retrieve a specific agent by name."""
    agents = get_all_agents()
    if name not in agents:
        raise KeyError(f"Agent '{name}' not found. Available agents: {list(agents.keys())}")
    return agents[name]

# =============================================================================
# MAIN EXECUTION
# =============================================================================

if __name__ == "__main__":
    """Demo script to verify agent creation and display agent information."""
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