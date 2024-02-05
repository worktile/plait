export enum Direction {
    left = 'left',
    top = 'top',
    right = 'right',
    bottom = 'bottom'
}

export type Vector = [number, number];

export type DirectionFactor = -1 | 0 | 1;

export type DirectionFactors = [DirectionFactor, DirectionFactor];
