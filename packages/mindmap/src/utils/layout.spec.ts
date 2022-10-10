import { getAvailableSubLayouts } from './layout';
import { MindmapLayoutType } from '@plait/layouts';

describe('layout', () => {
    describe('getAvailableSubLayouts', () => {
        it(`shoulde get 'right', 'rightTopIndented', 'rightBottomIndented' when layout equals right`, () => {
            const availableSubLayouts = getAvailableSubLayouts(MindmapLayoutType.right);
            expect(availableSubLayouts.includes(MindmapLayoutType.right)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.rightTopIndented)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.rightBottomIndented)).toBeTrue();
            expect(availableSubLayouts.length).toEqual(3);
        });
        it(`shoulde get 'right', 'rightBottomIndented', 'downward' when layout equals rightBottomIndented`, () => {
            const availableSubLayouts = getAvailableSubLayouts(MindmapLayoutType.rightBottomIndented);
            expect(availableSubLayouts.includes(MindmapLayoutType.right)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.rightBottomIndented)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.downward)).toBeTrue();
            expect(availableSubLayouts.length).toEqual(3);
        });
        it(`shoulde get 'upward', 'rightTopIndented' when layout equals rightTopIndented`, () => {
            const availableSubLayouts = getAvailableSubLayouts(MindmapLayoutType.upward, MindmapLayoutType.rightTopIndented);
            expect(availableSubLayouts.includes(MindmapLayoutType.upward)).toBeTrue();
            expect(availableSubLayouts.includes(MindmapLayoutType.rightTopIndented)).toBeTrue();
            expect(availableSubLayouts.length).toEqual(2);
        });
    });
});
