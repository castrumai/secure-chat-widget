// server.js

// --- Imports ---
// 'express' is a framework for building web servers in Node.js.
// 'dotenv' loads environment variables from a .env file into process.env.
// 'node-fetch' allows the Node.js server to make HTTP requests to other APIs (like OpenAI).
const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// --- Initialization ---
// Load the environment variables from the .env file.
dotenv.config();

// Create an instance of the Express application.
const app = express();
// Define the port the server will run on. Use the environment variable or default to 3000.
const port = process.env.PORT || 3000;

// --- Middleware ---
// This middleware parses incoming request bodies in JSON format, making them available on `req.body`.
app.use(express.json());
// This middleware serves static files (like HTML, CSS, JS, and JSON) from the 'public' directory.
// This is how the browser gets access to index.html, widget.js, and your knowledge base files.
app.use(express.static('public'));


// --- API Routes (Proxies) ---

/**
 * @route   POST /api/chat
 * @desc    Acts as a secure proxy to the OpenAI Chat Completions API.
 * It receives a request from the frontend, adds the secret API key,
 * forwards it to OpenAI, and then sends OpenAI's response back to the frontend.
 */
app.post('/api/chat', async (req, res) => {
    try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // The secret API key is securely added here from environment variables.
                // It is never exposed to the client-side.
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            // The body from the original frontend request is passed through.
            body: JSON.stringify(req.body)
        });

        const data = await openaiResponse.json();
        // Send the response from OpenAI back to the client with the same status code.
        res.status(openaiResponse.status).json(data);

    } catch (error) {
        console.error('Error proxying to OpenAI:', error);
        res.status(500).json({ error: 'Internal Server Error while contacting OpenAI.' });
    }
});

/**
 * @route   POST /api/log
 * @desc    Acts as a secure proxy to the Supabase API for logging conversations.
 * It adds the secret Supabase keys to the request before sending it.
 */
app.post('/api/log', async (req, res) => {
    try {
        const supabaseResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // The secret Supabase keys are securely added here.
                'apikey': process.env.SUPABASE_API_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_API_KEY}`,
                'Prefer': 'return=minimal' // Supabase-specific header.
            },
            body: JSON.stringify(req.body)
        });

        // Check if the request to Supabase was successful.
        if (!supabaseResponse.ok) {
            const errorText = await supabaseResponse.text();
            throw new Error(errorText);
        }

        // If successful, send back a 204 "No Content" status, as we don't need to return data.
        res.status(204).send();

    } catch (error) {
        console.error('Error proxying to Supabase:', error);
        res.status(500).json({ error: 'Internal Server Error while contacting Supabase.' });
    }
});


// --- Start Server ---
// This starts the server and makes it listen for incoming requests on the specified port.
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
