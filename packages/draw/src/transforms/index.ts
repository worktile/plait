import { insertText, insertGeometry, resizeGeometry, switchGeometryShape, insertGeometryByVector } from './geometry';
import { setText, setTextSize } from './geometry-text';
import { insertImage } from './image';
import { connectLineToGeometry, removeLineText, resizeLine, setLineMark, setLineShape, setLineTexts } from './line';
import { addSwimlaneColumn, addSwimlaneRow, removeSwimlaneColumn, removeSwimlaneRow, setSwimlaneFill, updateSwimlaneCount } from './swimlane';
import { setDrawShapeText } from './multi-text-geometry-text';
import { setTableText } from './table-text';

export const DrawTransforms = {
    setText,
    setDrawShapeText,
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
    insertGeometryByVector,
    setTableText,
    addSwimlaneRow,
    addSwimlaneColumn,
    removeSwimlaneRow,
    removeSwimlaneColumn,
    setSwimlaneFill,
    updateSwimlaneCount
};
