import { Point } from './point';

export const SELECTION_BORDER_COLOR = '#6698FF';
export const SELECTION_FILL_COLOR = '#6698FF19'; // 主色 0.1 透明度

export interface Selection {
    anchor: Point;
    focus: Point;
}

export const Selection = {
    isCollapsed(selection: Selection) {
        if (selection.anchor[0] == selection.focus[0] && selection.anchor[1] === selection.focus[1]) {
            return true;
        } else {
            return false;
        }
    }
};
