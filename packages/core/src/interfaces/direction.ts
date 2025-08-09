export enum Direction {
    left = 'left',
    top = 'top',
    right = 'right',
    bottom = 'bottom'
}

export const isHorizontalDirection = (direction: Direction) => {
    return direction === Direction.left || direction === Direction.right;
};

export const isVerticalDirection = (direction: Direction) => {
    return !isHorizontalDirection(direction);
};

export type Vector = [number, number];

export type DirectionFactor = -1 | 0 | 1;

export type DirectionFactors = [DirectionFactor, DirectionFactor];
