export const isMobileDeviceEvent = (event: PointerEvent) => {
    return isPencilEvent(event) || isTouchEvent(event);
};

export const isPencilEvent = (event: PointerEvent) => {
    return event.pointerType === 'pen';
};

export const isTouchEvent = (event: PointerEvent) => {
    return event.pointerType === 'touch';
};

export const isMouseEvent = (event: PointerEvent) => {
    return event.pointerType === 'mouse';
};
