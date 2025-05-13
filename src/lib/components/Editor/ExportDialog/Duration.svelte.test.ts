import { expect, test } from 'vitest';
import { convertSecondsToDuration } from './Duration.svelte';

test('Zero', () => {
	expect(convertSecondsToDuration(0)).toEqual('0:00');
});

test('Under 1 minute', () => {
	expect(convertSecondsToDuration(30)).toEqual('0:30');
});

test('1 minute', () => {
	expect(convertSecondsToDuration(60)).toEqual('1:00');
});

test('Above 10 minutes', () => {
	expect(convertSecondsToDuration(60 * 10 + 33)).toEqual('10:33');
});

test('1 hour', () => {
	expect(convertSecondsToDuration(60 * 60)).toEqual('1:00:00');
});

test('Above 10 hours', () => {
	expect(convertSecondsToDuration(60 * 60 * 10 + 60 * 1 + 5)).toEqual('10:01:05');
});
