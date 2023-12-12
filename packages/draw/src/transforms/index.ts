import { setFillColor, setStrokeColor, setStrokeStyle, setStrokeWidth } from './property';
import { insertText, insertGeometry, resizeGeometry, transformShape } from './geometry';
import { setText, setTextSize } from './geometry-text';
import { insertImage } from './image';
import { removeLineText, resizeLine, setLineMark, setLineTexts } from './line';

export const DrawTransforms = {
    setText,
    insertGeometry,
    resizeGeometry,
    insertText,
    setTextSize,
    resizeLine,
    setLineTexts,
    removeLineText,
    setLineMark,
    insertImage,
    transformShape,
    setStrokeColor,
    setStrokeWidth,
    setFillColor,
    setStrokeStyle
};
