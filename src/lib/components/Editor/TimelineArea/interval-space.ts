export interface RangeInterval {
	start: number;
	end: number;
}

export interface CenteredInterval {
	center: number;

	/** The amount of visible space to either side of `center`. */
	rangeFromCenter: number;
}

export function convertRangeToCenteredInterval(range: RangeInterval): CenteredInterval {
	return {
		center: (range.start + range.end) / 2,
		rangeFromCenter: (range.end - range.start) / 2
	};
}

export function convertCenteredToRangeInterval(centered: CenteredInterval): RangeInterval {
	return {
		start: centered.center - centered.rangeFromCenter,
		end: centered.center + centered.rangeFromCenter
	};
}

export function constrainRangeInterval(interval: RangeInterval): RangeInterval {
	return {
		start: Math.min(Math.max(interval.start, 0), 1),
		end: Math.min(Math.max(interval.end, 0), 1)
	};
}

export function constrainCenteredInterval(interval: CenteredInterval): CenteredInterval {
	const rangeFromCenter = Math.min(Math.max(interval.rangeFromCenter, 0), 0.5);

	const centerMin = rangeFromCenter;
	const centerMax = 1 - rangeFromCenter;
	const center = Math.min(Math.max(interval.center, centerMin), centerMax);

	return { center, rangeFromCenter };
}
