export const TOOL_REGISTRY = {
  generateSchema: {
    description:
      "Fetches and returns the database schema as SQL CREATE statements.",
    when_to_use:
      "Use when schema is missing or query references unknown fields. and before going for executing generateQuery",
  },
  generateQuery: {
    description: "Generates SQL based on user intent and schema.",
    when_to_use: "Always used before executing SQL.",
  },
  queryPlanner: {
    description: "Generate sophisticated plan to handle given user query",
    when_to_use:
      "Use it if given plan by planner is not efficient or possible or not secure then make it to generate new plan ",
  },
  executeQuery: {
    description: "Executes SQL safely on the user's SQLite database.",
    when_to_use: "Only after validator approves.",
  },
  summarizeOutput: {
    description: "Summarize output to show user in  natural language response",
    when_to_use:
      "use it after getting executing query and result is get stored to generate response for user",
  },
  generalChat: {
    description: "Handles generic or meta conversational queries.",
    when_to_use:
      "When the query is not SQL-related, or agent must talk normally.",
  },
  complexQueryApproval: {
    description:
      "Asks user permission before running modification/manipulation queries.",
    when_to_use: "When SQL contains UPDATE/DELETE/INSERT/MODIFY.",
  },
};
