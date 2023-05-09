import { MindLayoutType } from '@plait/layouts';

export enum LayoutDirection {
    'top' = 'top',
    'right' = 'right',
    'bottom' = 'bottom',
    'left' = 'left'
}

export const LayoutDirectionsMap: LayoutDirectionMapType = {
    [MindLayoutType.right]: [LayoutDirection.right],
    [MindLayoutType.left]: [LayoutDirection.left],
    [MindLayoutType.upward]: [LayoutDirection.top],
    [MindLayoutType.downward]: [LayoutDirection.bottom],
    [MindLayoutType.rightBottomIndented]: [LayoutDirection.right, LayoutDirection.bottom],
    [MindLayoutType.rightTopIndented]: [LayoutDirection.right, LayoutDirection.top],
    [MindLayoutType.leftBottomIndented]: [LayoutDirection.left, LayoutDirection.bottom],
    [MindLayoutType.leftTopIndented]: [LayoutDirection.left, LayoutDirection.top]
};

export type LayoutDirectionMapType = { [key: string]: LayoutDirection[] };
