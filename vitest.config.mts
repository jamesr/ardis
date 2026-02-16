import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
		env: {
			STRAVA_CLIENT_ID: 'test_client_id',
			STRAVA_CLIENT_SECRET: 'test_client_secret',
		},
	},
});
