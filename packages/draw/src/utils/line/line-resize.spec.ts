import { Point } from '@plait/core';
import { getIndexAndDeleteCountByKeyPoint } from './line-resize';

describe('getIndexAndDeleteCountByKeyPoint', () => {
    describe('both the startPoint and endPoint are not on the elbow line segment', () => {
        it('both the startPoint and endPoint is on the same line as the dataPoints', () => {
            /**
             * dataPoints
             * 0 🔴<------
             *   ｜
             *   ｜
             * 1 🔴------------>
             *
             *  nextKeyPoints
             * 1 🟢<----🟢 0
             *   ｜
             * handle
             *   ｜
             * 2 🟢----------------->🟢 3
             *                       ｜
             *                       ｜
             *                <------🟢 4
             */
            const dataPoints: Point[] = [
                [1, 1],
                [1, 2]
            ];
            const nextKeyPoints: Point[] = [
                [0, 5],
                [1, 5],
                [1, 7],
                [3, 7],
                [3, 8]
            ];
            const handleIndex = 1;
            const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(dataPoints, nextKeyPoints, handleIndex);
            expect(index).toBe(0);
            expect(deleteCount).toBe(2);
        });
        it('only the startPoint is on the same line as the dataPoints', () => {
            /**
             * dataPoints
             * 0 🔴<----
             *   ｜
             *   ｜
             * 1 🔴 ---------->
             *
             *  nextKeyPoints
             * 1 🟢<----🟢 0
             *   ｜
             *   ｜
             * 2 🟢-----handle------>🟢 3
             *                       ｜
             *                       ｜
             *                <------🟢 4
             */
            const dataPoints: Point[] = [
                [1, 1],
                [1, 2]
            ];
            const nextKeyPoints: Point[] = [
                [0, 5],
                [1, 5],
                [1, 7],
                [3, 7],
                [3, 8]
            ];
            const handleIndex = 2;
            const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(dataPoints, nextKeyPoints, handleIndex);
            expect(index).toBe(1);
            expect(deleteCount).toBe(1);
        });
        it('only the endPoint is on the same line as the dataPoints', () => {
            /**
             *                      dataPoints
             *              -------->🔴 0
             *                       ｜
             *                       ｜
             *                <------🔴 1
             *
             *  nextKeyPoints
             * 1 🟢<----🟢 0
             *   ｜
             *   ｜
             * 2 🟢-----handle------>🟢 3
             *                       ｜
             *                       ｜
             *                <------🟢 4
             */
            const dataPoints: Point[] = [
                [3, 1],
                [3, 2]
            ];
            const nextKeyPoints: Point[] = [
                [0, 5],
                [1, 5],
                [1, 7],
                [3, 7],
                [3, 8]
            ];
            const handleIndex = 2;
            const { index, deleteCount } = getIndexAndDeleteCountByKeyPoint(dataPoints, nextKeyPoints, handleIndex);
            expect(index).toBe(0);
            expect(deleteCount).toBe(1);
        });
    });
});
