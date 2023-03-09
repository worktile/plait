import { Point } from './point';

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
