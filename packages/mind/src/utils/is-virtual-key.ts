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
