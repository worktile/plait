import { getCurveLabelPoints, getElbowLabelPoints, getStraightLabelPoints } from './get-label-points';

describe('utils edge get label points', () => {
    it('should get elbow label points', () => {
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
        const halfPoints = getElbowLabelPoints(points, 2);
        expect(halfPoints.length).toBe(1);
        expect(halfPoints).toEqual([{ x: 4, y: 12 }]);

        const labelPoints = getElbowLabelPoints(points, 4);
        expect(labelPoints.length).toBe(3);
        expect(labelPoints).toEqual([
            { x: 0, y: 8 },
            { x: 4, y: 12 },
            { x: 12, y: 12 }
        ]);
    });

    it('should get straight label points', () => {
        /**
         *        (0,12)
         *          |
         *          |
         *        (0,8)
         *          |
         *          |
         *        (0,4)
         *          |
         *          |
         *        (0,0)
         */
        const points = [
            { x: 0, y: 0 },
            { x: 0, y: 12 }
        ];
        const halfPoints = getStraightLabelPoints(points, 2);
        expect(halfPoints.length).toBe(1);
        expect(halfPoints).toEqual([{ x: 0, y: 6 }]);

        const labelPoints = getElbowLabelPoints(points, 3);
        expect(labelPoints.length).toBe(2);
        expect(labelPoints).toEqual([
            { x: 0, y: 4 },
            { x: 0, y: 8 }
        ]);
    });

    it('should get curve label points', () => {
        /**
         *
         *
         *
         *               __(50,100)__
         *              /            \
         *             /              \
         *            /                \
         *           /                  \
         *          /                    \
         *        (0,0)                 (100,0)
         */
        const points = [
            { x: 0, y: 0 },
            { x: 50, y: 100 },
            { x: 100, y: 0 }
        ];
        const halfPoints = getCurveLabelPoints(points, 2);
        expect(halfPoints.length).toBe(1);
        expect(halfPoints).toEqual([{ x: 50, y: 50 }]);

        const labelPoints = getCurveLabelPoints(points, 4);
        expect(labelPoints.length).toBe(3);
        expect(labelPoints).toEqual([
            { x: 25, y: 37.5 },
            { x: 50, y: 50 },
            { x: 75, y: 37.5 }
        ]);
    });
});
