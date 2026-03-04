// 1. Load the environment variables from the .env file
require('dotenv').config();

const OpenAI = require("openai");

// 2. Initialize the client. 
// It will automatically find OPENAI_API_KEY and OPENAI_BASE_URL from your .env
const client = new OpenAI();

async function main() {
    try {
        console.log("Sending request to Amazon Bedrock...");

        const response = await client.chat.completions.create({
            model: "openai.gpt-oss-120b",
            messages: [
                { 
                    role: "user", 
                    content: "Write a one-sentence bedtime story about a unicorn." 
                }
            ],
        });

        // 3. Print the result
        // Note: The OpenAI SDK standard structure is response.choices[0].message.content
        console.log("\nResponse:");
        console.log(response.choices[0].message.content);

    } catch (error) {
        console.error("Error communicating with Bedrock:", error.message);
    }
}

main();