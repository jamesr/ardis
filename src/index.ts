import express from 'express';
import { registerAuth } from './auth.js';
import { registerWebhooks } from './webhooks.js';
import { strava } from './strava.js';
import { createExpressHandlers } from 'strava-sdk';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

registerAuth(app);

registerWebhooks();
const WEBHOOK_VERIFY_TOKEN = 'ardis-webhook-verify-token';
const handlers = createExpressHandlers(strava, WEBHOOK_VERIFY_TOKEN);
app.get('/ardis/webhooks', handlers.webhooks.verify());
app.post('/ardis/webhooks', handlers.webhooks.events());

app.listen(3000);
