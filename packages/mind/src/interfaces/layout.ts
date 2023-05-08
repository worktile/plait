import { MindmapLayoutType } from '@plait/layouts';

export enum LayoutDirection {
    'top' = 'top',
    'right' = 'right',
    'bottom' = 'bottom',
    'left' = 'left'
}

export const LayoutDirectionsMap: LayoutDirectionMapType = {
    [MindmapLayoutType.right]: [LayoutDirection.right],
    [MindmapLayoutType.left]: [LayoutDirection.left],
    [MindmapLayoutType.upward]: [LayoutDirection.top],
    [MindmapLayoutType.downward]: [LayoutDirection.bottom],
    [MindmapLayoutType.rightBottomIndented]: [LayoutDirection.right, LayoutDirection.bottom],
    [MindmapLayoutType.rightTopIndented]: [LayoutDirection.right, LayoutDirection.top],
    [MindmapLayoutType.leftBottomIndented]: [LayoutDirection.left, LayoutDirection.bottom],
    [MindmapLayoutType.leftTopIndented]: [LayoutDirection.left, LayoutDirection.top]
};

export type LayoutDirectionMapType = { [key: string]: LayoutDirection[] };
