export interface Egan {
	readonly date: string; // Date in YYYY-MM-DD format
	readonly route: number; // Strava route number
	readonly name: string; // Short unique identifier, format 'egan-YYYY-NN'
	readonly title: string; // Human readable/selected name
	readonly segments: Set<number>;
}

export const egans = new Map<string, Egan>([
	[
		'egan-2026-00-test',
		// TODO: Load real data from somewhere - static files, perhaps?
		{
			date: '2026-02-24',
			route: 12345,
			name: 'egan-2026-00-test',
			title: 'Test Egan ride',
			segments: new Set([646697, 6571998]),
		} as Egan,
	],
]);

export function allEgans() : Array<string> {
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
