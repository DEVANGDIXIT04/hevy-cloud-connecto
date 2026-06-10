# 🏋️‍♂️ Hevy MCP Server

A fully-featured [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that seamlessly integrates the [Hevy Workout Tracker](https://www.hevyapp.com/) API directly into AI assistants like Claude. 

This project empowers AI models to natively read, create, update, and search your Hevy workout routines and exercise data through natural language commands, effectively acting as an intelligent personal trainer and data manager.

## ✨ Features

- **Read Live Data:** Fetch your recent workouts and saved routines instantly.
- **Create & Update Routines:** Tell your AI to "Create a Chest Day routine" or "Add Bicep Curls to Day 1", and watch it automatically execute the API calls to update your Hevy account.
- **Intelligent Exercise Search:** Features a custom search tool that allows the AI to query Hevy's massive exercise template database to find precise `exercise_template_id`s completely autonomously.
- **Cloud-Ready SSE Transport:** Built with a custom Express.js layer and Server-Sent Events (SSE) to bypass standard local MCP limitations. This allows the server to be hosted on cloud platforms (like Render or Vercel) and connected directly to a mobile AI client without needing a PC running 24/7.
- **Bypass Authentication:** Includes a clever OAuth-bypass mechanism to seamlessly connect to Claude's strict Custom Connector authentication flow.

## 🚀 Why I Built This (Resume Context)

I built this project to explore the bleeding-edge of AI agent capabilities. Standard AI models are isolated, but by utilizing the Model Context Protocol, I successfully transformed an LLM into an active agent that can manipulate real-world data.

By reverse-engineering the authentication flows required by modern AI clients and building a custom SSE transport layer, I was able to decouple the AI agent from a local environment and create a persistent, cloud-hosted bridge between my mobile AI assistant and my Hevy workout data.

## 🛠️ Technology Stack

- **TypeScript / Node.js**
- **Model Context Protocol (MCP) SDK**
- **Express.js** (Custom SSE routing and OAuth spoofing)
- **Zod** (Robust schema validation for AI tool calls)
- **Hevy REST API**

## 📖 How It Works

1. **The Request:** The user tells the AI (e.g., Claude app on iOS/Android): *"Add Cable Crunches to my Monday Routine."*
2. **The Search:** The AI automatically invokes the `search_exercises` MCP tool. The Express server queries the Hevy API, filters the results, and returns the unique template ID for "Cable Crunch".
3. **The Execution:** The AI then invokes the `update_routine` MCP tool with the correct payload and schema. The server translates this into an authenticated `PUT` request to Hevy's official servers.
4. **The Result:** The user's routine is updated instantly in their Hevy app.

## ⚙️ Setup & Deployment

1. Clone the repository.
2. Install dependencies: `npm install`
3. Add your Hevy API Key to a `.env` file: `HEVY_API_KEY=your_key_here`
4. Build the project: `npm run build`
5. Start the server: `npm start`

To connect to Claude, expose the `/sse` endpoint and provide dummy OAuth credentials.
