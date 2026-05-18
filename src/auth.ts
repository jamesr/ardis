import express from 'express';
import { strava } from './strava.js';

export function registerAuth(app: express.Express) {
	app.get('/ardis/auth', (req, res) => {
		console.log('auth get');
		const authUrl = strava.oauth.getAuthUrl({
			scopes: ['activity:read'],
			state: 'optional-csrf-token',
		});
		res.redirect(authUrl);
	});

	// Handle OAuth callback
	app.get('/ardis/callback', async (req, res) => {
		console.log('callback get');
		const { code } = req.query;

		try {
			const tokens = await strava.oauth.exchangeCode(code as string);

			// Save tokens using your storage implementation
			await strava.storage.saveTokens(tokens.athlete.id.toString(), {
				athleteId: tokens.athlete.id.toString(),
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token,
				expiresAt: new Date(tokens.expires_at * 1000),
			});

			res.send(`Welcome, ${tokens.athlete.firstname}!`);
		} catch (error) {
			res.status(500).send(`Authentication failed: ${error}`);
		}
	});
}
