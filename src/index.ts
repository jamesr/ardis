import express from 'express';
import { registerAuth } from './auth.js';
import { registerWebhooks } from './webhooks.js';
import { WEBHOOKS_VERIFY_TOKEN, strava } from './strava.js';
import { createExpressHandlers } from 'strava-sdk';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

registerAuth(app);

registerWebhooks();
const handlers = createExpressHandlers(strava, WEBHOOKS_VERIFY_TOKEN);

// TODO: check await strava.webhooks.listSubscriptions(); and if needed
try {
	strava.webhooks.createSubscription('https://staging.eganride.org/ardis/webhooks');
} catch (error) {
	console.warn(`could not create subscription: ${error}`);
}

app.get('/ardis/webhooks', handlers.webhooks.verify());
app.post('/ardis/webhooks', handlers.webhooks.events());

app.listen(3000);
