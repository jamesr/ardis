export interface Egan {
	readonly date: string; // Date in YYYY-MM-DD format
	readonly route: string; // Strava route number
	readonly name: string; // Short unique identifier, format 'egan-YYYY-NN'
	readonly title: string; // Human readable/selected name
	readonly segments: Set<number>;
}

export const egans = new Map<string, Egan>([
	[
		'egan-2026-01',
		// TODO: Load real data from somewhere - static files, perhaps?
		{
			date: '2026-03-11', // A lie, the actual date was 03-10
			route: '2874856572963175602',
			name: 'egan-2026-01',
			title: "Egan 2026.01: Let's Cancel Egan 2026!",
			segments: new Set([4243560, 610571, 21036783, 10534914, 3687553, 686220, 863594]),
		} as Egan,
	],
]);

export function allEgans(): Array<string> {
	return egans.keys().toArray();
}

export function findEganByDate(activityDate: string): Egan | null {
	for (const egan of egans.values()) {
		if (egan.date == activityDate) {
			return egan;
		}
	}
	return null;
}

export function findEganByName(name: string): Egan | null {
	if (egans.has(name)) {
		return egans.get(name)!;
	}
	return null;
}
