import { insertText, insertGeometry, resizeGeometry, switchGeometryShape, insertGeometryByVector } from './geometry';
import { setText, setTextSize } from './geometry-text';
import { insertImage } from './image';
import {
    connectArrowLineToGeometry,
    removeArrowLineText,
    resizeArrowLine,
    setArrowLineMark,
    setArrowLineShape,
    setArrowLineTexts
} from './arrow-line';
import { addSwimlaneColumn, addSwimlaneRow, removeSwimlaneColumn, removeSwimlaneRow, updateSwimlaneCount } from './swimlane';
import { setDrawShapeText } from './multi-text-geometry-text';
import { setTableText } from './table-text';
import { setTableFill } from './table';

export const DrawTransforms = {
    setText,
    setDrawShapeText,
    insertGeometry,
    resizeGeometry,
    insertText,
    setTextSize,
    resizeArrowLine,
    setArrowLineTexts,
    removeArrowLineText,
    setArrowLineMark,
    setArrowLineShape,
    insertImage,
    switchGeometryShape,
    connectArrowLineToGeometry,
    insertGeometryByVector,
    setTableText,
    addSwimlaneRow,
    addSwimlaneColumn,
    removeSwimlaneRow,
    removeSwimlaneColumn,
    updateSwimlaneCount,
    setTableFill
};
