import { StrokeStyle } from '../constants';

export const getStrokeLineDash = (strokeStyle: StrokeStyle, strokeWidth: number) => {
    switch (strokeStyle) {
        case StrokeStyle.dashed:
            return [8, 8 + strokeWidth];
        case StrokeStyle.dotted:
            return [2, 4 + strokeWidth];
        default:
            return undefined;
    }
};
