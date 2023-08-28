import { getLabelPoints } from './get-smooth-step-edge';

describe('utils edge get smooth step', () => {
    it('should get label points', () => {
        /**
         *        (0,12)------------------(16,12)-----> (20,12)
         *          |
         *          |
         *          |
         *          |
         *        (0,4)
         *          |
         *          |
         *        (0,0)
         */
        const points = [
            { x: 0, y: 0 },
            { x: 0, y: 4 },
            { x: 0, y: 12 },
            { x: 16, y: 12 },
            { x: 20, y: 12 }
        ];
        const halfPoints = getLabelPoints(points, 2);
        expect(halfPoints.length).toBe(1);
        expect(halfPoints).toEqual([{ x: 4, y: 12 }]);

        const labelPoints = getLabelPoints(points, 4);
        expect(labelPoints.length).toBe(3);
        expect(labelPoints).toEqual([
            { x: 0, y: 8 },
            { x: 4, y: 12 },
            { x: 12, y: 12 }
        ]);
    });
});
