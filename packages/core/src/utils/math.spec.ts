import { Point } from '../interfaces';
import { isLineHitLine } from './math';

describe('math', () => {
    describe('isLineHitLine', () => {
        it('should not hit when two lines both are point', () => {
            const p1 = [0, 0] as Point;
            const p2 = [0, 0] as Point;
            const p3 = [1, 2] as Point;
            const p4 = [1, 2] as Point;
            const isHit = isLineHitLine(p1, p2, p3, p4);
            expect(isHit).toEqual(false);
        });
    });
});
