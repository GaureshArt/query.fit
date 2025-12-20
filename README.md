🧠 Query.fit — AI-Native Database Assistant.

Query.fit is an AI-powered database assistant that allows users to query structured databases using natural language.
It converts user intent into safe SQL queries, executes them, and optionally visualizes results using charts — with human-in-the-loop safeguards for sensitive operations.

Built to explore real-world challenges in AI agents, database safety, and LLM orchestration.

🚨 Problem Statement

Querying databases requires:

SQL knowledge

Awareness of schema

Caution around destructive queries

Existing AI tools often:

Execute unsafe queries

Store user data irresponsibly

Lack clear guardrails

Query.fit focuses on correctness, safety, and explainability over blind automation.

🏗️ Architecture Overview

High-level flow:

User asks a question in natural language

LangGraph-based agent analyzes intent

Query is generated and validated

Risky queries require Human-in-the-Loop approval

Results are returned as:

Table output

Optional chart (bar / line / pie)

Persistent memory is intentionally avoided to protect sensitive database information.

![Query.fit Architecture](./image.png)

🤖 Why LangGraph?

LangGraph is used to:

Model agent workflows as a graph

Route decisions between:

Query generation

Validation

HITL approval

Visualization

Prevent uncontrolled LLM execution

This allows deterministic control over non-deterministic models.

🔐 Security & Safety Decisions
❌ No Persistent Chat Memory

Database conversations may contain sensitive data

Storing history increases risk

Session-based, ephemeral memory is used instead

🛑 Guardrails

Destructive queries (DELETE, DROP, UPDATE) are blocked

HITL approval required for risky operations



📊 Chart Generation

Query.fit can automatically generate:

Bar charts

Line charts

Pie charts

Charts are only generated when the query result is suitable, avoiding misleading visualizations.


🧠 Key Learnings

AI agents need constraints, not autonomy

HITL is essential for database-related AI systems

Not all problems benefit from persistent memory

System design matters more than model choice


🛠️ Tech Stack

TypeScript

LangGraph

LangChain

Supabase

SQL (multiple DB support)

Charting library (bar / line / pie)

🎯 Who Is This For?

Recruiters evaluating AI/LLM engineers

Engineers interested in safe AI agents

Anyone exploring database + LLM integrations

Done > perfect.