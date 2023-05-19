import { Point } from '@plait/core';
import { directionDetector } from './direction';

const targetNode: any = {
    children: [],
    depth: 2,
    hGap: 28,
    height: 56,
    layout: 'standard',
    left: false,
    origin: {
        id: '1-4-1',
        value: {
            children: [
                {
                    text: '布局算法'
                }
            ]
        },
        children: [],
        width: 56,
        height: 24
    },
    up: false,
    vGap: 12,
    width: 128,
    x: 860,
    y: 268.5
};

describe('direction-detector', () => {
    /**
     *   (860,268.5) ----------------------------------------------- (988, 268.5)
     *              |  (888, 280.5)   ------------  (960, 280.5)    |
     *              |                |             |                |
     *              |                | (924,296.5) |                |
     *              |                |             |                |
     *              |  (888, 312.5)   ------------- (960, 312.5)    |
     *   (860,324.5) ----------------------------------------------- (988, 324.5)
     */

    let centerPoint: Point = [870, 283.5];
    it('should get left direction', () => {
        centerPoint = [870, 283.5];
        const direction = directionDetector(targetNode, centerPoint);
        expect(direction).toContain('left');
    });

    it('should get left and top direction', () => {
        centerPoint = [900, 283.5];
        const direction = directionDetector(targetNode, centerPoint);
        expect(direction).toContain('left');
        expect(direction).toContain('top');
    });

    it('should get left and bottom direction', () => {
        centerPoint = [900, 300];
        const direction = directionDetector(targetNode, centerPoint);
        expect(direction).toContain('left');
        expect(direction).toContain('bottom');
    });

    it('should get right direction', () => {
        centerPoint = [970, 283.5];
        const direction = directionDetector(targetNode, centerPoint);
        expect(direction).toContain('right');
    });

    it('should get right and top direction', () => {
        centerPoint = [930, 283.5];
        const direction = directionDetector(targetNode, centerPoint);
        expect(direction).toContain('right');
        expect(direction).toContain('top');
    });

    it('should get right and bottom direction', () => {
        centerPoint = [930, 300];
        const direction = directionDetector(targetNode, centerPoint);
        expect(direction).toContain('right');
        expect(direction).toContain('bottom');
    });

    it('should get top direction', () => {
        centerPoint = [900, 290];
        const direction = directionDetector(targetNode, centerPoint);
        expect(direction).toContain('top');
    });

    it('should get bottom direction', () => {
        centerPoint = [900, 300];
        const direction = directionDetector(targetNode, centerPoint);
        expect(direction).toContain('bottom');
    });

    it('should get null', () => {
        centerPoint = [900, 325];
        let direction = directionDetector(targetNode, centerPoint);
        expect(direction).toBe(null);

        centerPoint = [900, 250];
        direction = directionDetector(targetNode, centerPoint);
        expect(direction).toBe(null);

        centerPoint = [850, 283.5];
        direction = directionDetector(targetNode, centerPoint);
        expect(direction).toBe(null);

        centerPoint = [990, 283.5];
        direction = directionDetector(targetNode, centerPoint);
        expect(direction).toBe(null);
    });
});
