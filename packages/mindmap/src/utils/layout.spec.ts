import { getAvailableSubLayouts } from "./layout";
import { MindmapLayoutType } from '@plait/layouts';

describe('layout', () => {
    describe('getAvailableSubLayouts', () => {
        it(`shoulde get 'right', 'rightTopIndented', 'rightBottomIndented', 'upward', 'downward' when layout equals right`, () => {
            const availableSubLayouts = getAvailableSubLayouts(MindmapLayoutType.right);
            expect(availableSubLayouts.includes(MindmapLayoutType.right)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.rightTopIndented)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.rightBottomIndented)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.upward)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.downward)).toBeTrue();
            expect(availableSubLayouts.length).toEqual(5);
        });
        it(`shoulde get 'right', 'rightBottomIndented', 'downward' when layout equals rightBottomIndented`, () => {
            const availableSubLayouts = getAvailableSubLayouts(MindmapLayoutType.rightBottomIndented);
            console.log(availableSubLayouts);
            expect(availableSubLayouts.includes(MindmapLayoutType.right)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.rightBottomIndented)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.downward)).toBeTrue();
            expect(availableSubLayouts.length).toEqual(3);
        });
    });
});