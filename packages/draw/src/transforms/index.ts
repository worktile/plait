import { insertText, insertGeometry, resizeGeometry, switchGeometryShape, insertGeometryByVector } from './geometry';
import { setText, setTextSize } from './geometry-text';
import { insertImage } from './image';
import { connectLineToGeometry, removeLineText, resizeLine, setLineMark, setLineShape, setLineTexts } from './line';

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
    setLineShape,
    insertImage,
    switchGeometryShape,
    connectLineToGeometry,
    insertGeometryByVector
};
