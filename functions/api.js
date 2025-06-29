// functions/api.js

// This file contains the logic for our serverless function.
// It replaces the original server.js file for deploying on Netlify.

const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');

// Create an instance of the Express application.
const app = express();

// Middleware to parse JSON request bodies.
app.use(express.json());

// We create a router to handle our API endpoints.
const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Acts as a secure proxy to the OpenAI Chat Completions API.
 * The keys are read from Netlify's environment variables.
 */
router.post('/chat', async (req, res) => {
    try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(req.body)
        });

        const data = await openaiResponse.json();
        res.status(openaiResponse.status).json(data);

    } catch (error) {
        console.error('Error in /chat function:', error);
        res.status(500).json({ error: 'Internal Server Error while contacting OpenAI.' });
    }
});

/**
 * @route   POST /api/log
 * @desc    Acts as a secure proxy to the Supabase API for logging.
 */
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

// Mount the router on the /api path.
// The redirect rule in netlify.toml ensures requests to /api/* are sent here.
app.use('/.netlify/functions/api', router);

// Export the app wrapped in the serverless-http handler.
// This is the required format for Netlify Functions to work with Express.
module.exports.handler = serverless(app);
