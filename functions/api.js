// functions/api.js (Corrected Version)

const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');

// Create an instance of the Express application.
const app = express();

// Create an Express router. A router is a mini-app that can handle requests.
const router = express.Router();

// Define the /chat route on the router.
// The path is relative to where the router is mounted.
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
// The typo 'router.log' is now corrected to 'router.post'
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

// Tell the main app to use our router. The '/api/' part is handled by the
// redirect rule in netlify.toml, so we mount it at the root here.
app.use(express.json()); // Make sure this is before the router
app.use('/', router);

// This is the required export for Netlify Functions.
module.exports.handler = serverless(app);
