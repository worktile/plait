import { Point } from '@plait/core';
import { getPointByUnitVectorAndVectorComponent, getUnitVectorByPointAndPoint } from './vector';

describe('vector', () => {
    describe('get unit vector by point and point', () => {
        it('the x,y components are negative unit vectors', () => {
            let start = [200, 100] as Point;
            let end = [0, 0] as Point;
            const unitVector = getUnitVectorByPointAndPoint(start, end);
            expect(unitVector[0]).toBeLessThan(0);
            expect(unitVector[1]).toBeLessThan(0);
        });
        it('the x,y components are positive unit vectors', () => {
            let start = [200, 100] as Point;
            let end = [0, 0] as Point;
            const unitVector = getUnitVectorByPointAndPoint(end, start);
            expect(unitVector[0]).toBeGreaterThan(0);
            expect(unitVector[1]).toBeGreaterThan(0);
        });
        it('the x is negative and the y components is positive', () => {
            let start = [200, -100] as Point;
            let end = [0, 0] as Point;
            const unitVector = getUnitVectorByPointAndPoint(start, end);
            expect(unitVector[0]).toBeLessThan(0);
            expect(unitVector[1]).toBeGreaterThan(0);
        });
        it('the x is positive and the y components is negative', () => {
            let start = [-200, 100] as Point;
            let end = [0, 0] as Point;
            const unitVector = getUnitVectorByPointAndPoint(start, end);
            expect(unitVector[0]).toBeGreaterThan(0);
            expect(unitVector[1]).toBeLessThan(0);
        });
        it('the x is positive and the y components is negative', () => {
            let start = [0, 0] as Point;
            let end = [40, 30] as Point;
            const unitVector = getUnitVectorByPointAndPoint(start, end);
            expect(unitVector[0]).toEqual(4/5);
            expect(unitVector[1]).toEqual(3/5)
        });
    });
    describe('get point on vector by vector and vector component', () => {
        it('get point by horizontal component', () => {
            const start = [200, 100] as Point;
            const end = [0, 0] as Point;
            const horizontalComponent = -50;
            const unitVector = getUnitVectorByPointAndPoint(start, end);
            const result1 = getPointByUnitVectorAndVectorComponent(start, unitVector, horizontalComponent, true);
            expect(result1[0]).toEqual(150);
            expect(result1[1]).toEqual(75);
            const result2 = getPointByUnitVectorAndVectorComponent(start, unitVector, -horizontalComponent, true);
            expect(result2[0]).toEqual(250);
            expect(result2[1]).toEqual(125);
        });
        it('get point by vertical component', () => {
            const start = [200, 100] as Point;
            const end = [0, 0] as Point;
            const verticalComponent = -50;
            const unitVector = getUnitVectorByPointAndPoint(start, end);
            const result1 = getPointByUnitVectorAndVectorComponent(start, unitVector, verticalComponent, false);
            expect(result1[0]).toEqual(100);
            expect(result1[1]).toEqual(50);
            const result2 = getPointByUnitVectorAndVectorComponent(start, unitVector, -verticalComponent, false);
            expect(result2[0]).toEqual(300);
            expect(result2[1]).toEqual(150);
        });
    });
});
