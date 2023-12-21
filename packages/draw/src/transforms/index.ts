import { insertText, insertGeometry, resizeGeometry, switchGeometryShape, insertGeometryByVector } from './geometry';
import { setText, setTextSize } from './geometry-text';
import { insertImage } from './image';
import { connectLineToGeometry, removeLineText, resizeLine, setLineMark, setLineTexts } from './line';

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
    switchGeometryShape,
    connectLineToGeometry,
    insertGeometryByVector
};
