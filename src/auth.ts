import express from 'express';
import { strava } from './strava.js';
import { registerAthlete } from './athlete.js';

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

			const athleteId = tokens.athlete.id!.toString();
			// Save tokens using your storage implementation
			await strava.storage.saveTokens(athleteId, {
				athleteId,
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token,
				expiresAt: new Date(tokens.expires_at * 1000),
			});

			await registerAthlete(parseInt(athleteId));
			res.redirect(`/ardis/athletes?id=${athleteId}`);
		} catch (error) {
			res.status(500).send(`Authentication failed: ${error}`);
		}
	});
}
