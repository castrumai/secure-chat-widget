// functions/api.js (Corrected Version)

const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');

// Create an instance of the Express application.
const app = express();

// Create an Express router. This will handle our specific endpoints.
const router = express.Router();

// Define the /chat route on the router.
// This will handle requests to /api/chat
router.post('/chat', async (req, res) => {
    try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Keys are read securely from Netlify's environment variables
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(req.body)
        });

        // Handle potential errors from the OpenAI API itself
        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            console.error("OpenAI API Error:", errorData);
            return res.status(openaiResponse.status).json(errorData);
        }

        const data = await openaiResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('Error in /chat function:', error);
        res.status(500).json({ error: 'Internal Server Error while contacting OpenAI.' });
    }
});

// Define the /log route on the router.
// This will handle requests to /api/log
router.post('/log', async (req, res) => {
     try {
        const supabaseResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_API_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_API_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(req.body)
        });

        if (!supabaseResponse.ok) {
            const errorText = await supabaseResponse.text();
            throw new Error(errorText);
        }

        res.status(204).send();

    } catch (error) {
        console.error('Error in /log function:', error);
        res.status(500).json({ error: 'Internal Server Error while contacting Supabase.' });
    }
});

// Use middleware to parse JSON. This must come before the router.
app.use(express.json());

// ** THE FIX IS HERE **
// Mount the router at the /api path. This tells our server to expect
// requests to start with /api (e.g., /api/chat, /api/log).
app.use('/api', router);

// This is the required export for Netlify Functions.
module.exports.handler = serverless(app);
