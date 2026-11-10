import { RectangleClient } from './rectangle-client';

describe('RectangleClient.getConnectionPoint', () => {
    const rectangle = { x: 10, y: 20, width: 100, height: 50 };

    it('returns the connection point for a valid [rx, ry]', () => {
        expect(RectangleClient.getConnectionPoint(rectangle, [0.5, 0.5])).toEqual([60, 45]);
    });

    it('falls back missing or non-finite connection components to 0.5', () => {
        expect(RectangleClient.getConnectionPoint(rectangle, [0.2] as any)).toEqual([30, 45]);
        expect(RectangleClient.getConnectionPoint(rectangle, [NaN, 0.2] as any)).toEqual([60, 30]);
    });
});
