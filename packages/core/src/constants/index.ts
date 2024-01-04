export * from './keycodes';
export * from './cursor';
export * from './selection';

export const HOST_CLASS_NAME = 'plait-board-container';

export const ACTIVE_MOVING_CLASS_NAME = 'active-with-moving';

export const SCROLL_BAR_WIDTH = 20;

export const MAX_RADIUS = 16;

export const POINTER_BUTTON = {
    MAIN: 0,
    WHEEL: 1,
    SECONDARY: 2,
    TOUCH: -1
} as const;

export const PRESS_AND_MOVE_BUFFER = 3;
