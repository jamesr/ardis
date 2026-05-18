import { describe, it, expect } from 'vitest';
import { shouldProcess } from '../src/activity';
import { DetailedSegmentEffort, StravaActivity } from 'strava-sdk';
import { Egan } from '../src/egan';

describe('activity processing', () => {
	it('filter non-public activities', async () => {
		const followersOnlyActivity = {
			id: 12345,
			visibility: 'followers',
		} as StravaActivity;
		expect(shouldProcess(followersOnlyActivity, {} as Egan)).toBe(false);
	});
	const testEgan = {
		date: '2026-03-10',
		segments: new Set([1, 2, 3]),
	} as Egan;
	it('filter no Egan segment attempts', async () => {
		const segments = [
			{
				id: 20,
				name: 'segment 20',
				elapsed_time: 5,
			},
		] as DetailedSegmentEffort[];
		const noEganSegmentActivity = {
			id: 12345,
			visibility: 'everyone',
			start_date: '2026-03-10T23:14:16Z',
			segment_efforts: segments,
		} as StravaActivity;
		expect(shouldProcess(noEganSegmentActivity, testEgan)).toBe(false);
	});
	it('plausible', async () => {
		const segments = [
			{
				id: 2,
				name: 'segment 2',
				elapsed_time: 5,
			},
		] as DetailedSegmentEffort[];
		const noEganSegmentActivity = {
			id: 12345,
			visibility: 'everyone',
			start_date: '2026-03-10T23:14:16Z',
			segment_efforts: segments,
		} as StravaActivity;
		expect(shouldProcess(noEganSegmentActivity, testEgan)).toBe(true);
	});
});
