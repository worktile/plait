import { hotkeys } from '@plait/core';
import { isKeyHotkey } from 'is-hotkey';

export function isVirtualKey(e: KeyboardEvent) {
    const isMod = e.ctrlKey || e.metaKey;
    const isAlt = isKeyHotkey('alt', e);
    const isShift = isKeyHotkey('shift', e);
    const isCapsLock = e.key.includes('CapsLock');
    const isTab = e.key.includes('Tab');
    const isEsc = e.key.includes('Escape');
    const isF = e.key.startsWith('F');
    const isArrow = e.key.includes('Arrow') ? true : false;
    return isCapsLock || isMod || isAlt || isArrow || isShift || isTab || isEsc || isF;
}

export const isExpandHotkey = (event: KeyboardEvent) => {
    return isKeyHotkey('mod+/', event);
};

export const isTabHotkey = (event: KeyboardEvent) => {
    return event.key === 'Tab';
};

export const isEnterHotkey = (event: KeyboardEvent) => {
    return event.key === 'Enter';
};

export const isSpaceHotkey = (event: KeyboardEvent) => {
    return event.code === 'Space';
};

export const isDelete = (event: KeyboardEvent) => {
    return hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event);
};
