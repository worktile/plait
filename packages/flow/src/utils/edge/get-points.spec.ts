import { Direction } from '@plait/core';
import { getStraightPoints } from './get-straight-points';
import { getElbowPoints } from './get-elbow-points';

describe('utils', () => {
    it('should get straight points', () => {
        /**
         *
         *      (0,0)—— —— ——— ——— ———(20,0)       (40,0)—— —— ——— ——— ———(60,0)
         *          |                 |                 |                 |
         *          |                 |—— —— —— —— —— —>|                 |
         *          |                 |                 |                 |
         *     (0,10)—— —— ——— ——— ———(20,10)     (40,10)—— —— ——— ——— ———(60,10)
         *
         *
         */
        const params: any = {
            sourceRectangle: {
                x: 0,
                y: 0,
                width: 20,
                height: 10
            },
            sourcePosition: Direction.right,
            targetRectangle: {
                x: 40,
                y: 0,
                width: 20,
                height: 10
            },
            targetPosition: Direction.left
        };
        const points = getStraightPoints(params);
        expect(points.length).toBe(2);
        expect(points[0]).toEqual([20, 5]);
        expect(points[1]).toEqual([40, 5]);
    });

    it('should get elbow points', () => {
        /**
         *                                    2 —— —— ——— ——— —— ——— 3
         *                                     |                    |
         *                                     |                    ⬇4
         *     (0,0)—— —— ——— ——— ———(20,0)    |     (40,0)—— —— ——— ——— ———(60,0)
         *          |                 |        |          |                 |
         *          |                0|-> — - — 1         |                 |
         *          |                 |                   |                 |
         *     (0,10)—— —— ——— ——— ———(20,10)       (40,10)—— —— ——— ——— ———(60,10)
         *
         *
         */

        const params: any = {
            sourceRectangle: {
                x: 0,
                y: 0,
                width: 20,
                height: 10
            },
            sourcePosition: Direction.right,
            targetRectangle: {
                x: 40,
                y: 0,
                width: 20,
                height: 10
            },
            targetPosition: Direction.top
        };
        const points = getElbowPoints(params);
        expect(points.length).toBe(5);
        expect(points[0]).toEqual([20, 5]);
        expect(points[1]).toEqual([30, 5]);
        expect(points[2]).toEqual([30, -30]);
        expect(points[3]).toEqual([50, -30]);
        expect(points[4]).toEqual([50, 0]);
    });
});
