export interface Egan {
	readonly date: string;
	readonly route: number;
	readonly segments: Set<number>;
}

export const egans = [
	// TODO: Load real data from somewhere - static files, perhaps?
	{
		date: '2026-02-24',
		route: 12345,
		segments: new Set([646697, 6571998]),
	},
] as Egan[];

export function findEgan(activityDate: string): Egan | null {
	for (const egan of egans) {
		if (egan.date == activityDate) {
			return egan;
		}
	}
	return null;
}
