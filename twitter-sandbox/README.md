# Twitter Sandbox

A Twitter Sandbox for testing your AI Agent.

## Local Usage

1. Clone the repo
2. Go to the twitter sandbox folder by `cd twitter-sandbox`
3. Install dependencies by `npm install`
4. Start app by using `npm run dev`

## Usage with Langflow

1. Visit https://twitter-sandbox-nine.vercel.app which is a hosted version of twitter sandbox, sign up / login is required.
2. In the side bar, choose Token and copy the JWT.
3. Copy and paste [Python Script](twitter-sandbox/create_twitter_langflow.py) into langflow to create tool
4. Paste your JWT in langflow and connect tool agent
5. Have fun with your AI Agent
