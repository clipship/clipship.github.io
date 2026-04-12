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

export function modifyIntervalZoomWithPivot(
	interval: CenteredInterval,
	delta: number,
	pivotInView: number
) {
	const { start, end } = convertCenteredToRangeInterval(interval);
	const pivotInInterval = start + (end - start) * pivotInView;

	let zoom = Math.log(interval.rangeFromCenter);
	zoom += delta;

	const rangeFromCenter = Math.exp(zoom);

	const { start: newStart, end: newEnd } = convertCenteredToRangeInterval({
		center: interval.center,
		rangeFromCenter: rangeFromCenter
	});

	const pivotInNewInterval = newStart + (newEnd - newStart) * pivotInView;

	return constrainCenteredInterval({
		center: interval.center + (pivotInInterval - pivotInNewInterval),
		rangeFromCenter: rangeFromCenter
	});
}

export function convertRangeToGlobalSpace(valueInRange: number, interval: RangeInterval) {
	return interval.start + valueInRange * (interval.end - interval.start);
}

export function convertGlobalToRangeSpace(value: number, interval: RangeInterval) {
	return (value - interval.start) / (interval.end - interval.start);
}
