import { getSelectedElements, getSelectionAngle, setAngleForG } from '.';
import { ACTIVE_STROKE_WIDTH, SELECTION_RECTANGLE_CLASS_NAME } from '../constants';
import { PlaitBoard, PlaitPluginKey, PlaitPointerType, RectangleClient, SELECTION_BORDER_COLOR } from '../interfaces';
import { PlaitOptionsBoard, WithPluginOptions, drawRectangle } from '../public-api';
import { setDragging } from './dnd';
import { getRectangleByElements } from './element';
import { BOARD_TO_IS_SELECTION_MOVING, BOARD_TO_TEMPORARY_ELEMENTS } from './weak-maps';

export function isSelectionMoving(board: PlaitBoard) {
    return !!BOARD_TO_IS_SELECTION_MOVING.get(board);
}

export function setSelectionMoving(board: PlaitBoard) {
    PlaitBoard.getBoardContainer(board).classList.add('selection-moving');
    BOARD_TO_IS_SELECTION_MOVING.set(board, true);
    setDragging(board, true);
}

export function clearSelectionMoving(board: PlaitBoard) {
    PlaitBoard.getBoardContainer(board).classList.remove('selection-moving');
    BOARD_TO_IS_SELECTION_MOVING.delete(board);
    setDragging(board, false);
}

export function isHandleSelection(board: PlaitBoard) {
    const options = (board as PlaitOptionsBoard).getPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection);
    return board.pointer !== PlaitPointerType.hand && !options.isDisabledSelect && !PlaitBoard.isReadonly(board);
}

export function isSetSelectionOperation(board: PlaitBoard) {
    return !!board.operations.find(value => value.type === 'set_selection');
}

export function getTemporaryElements(board: PlaitBoard) {
    const ref = BOARD_TO_TEMPORARY_ELEMENTS.get(board);
    if (ref) {
        return ref.elements;
    } else {
        return undefined;
    }
}

export function getTemporaryRef(board: PlaitBoard) {
    return BOARD_TO_TEMPORARY_ELEMENTS.get(board);
}

export function deleteTemporaryElements(board: PlaitBoard) {
    BOARD_TO_TEMPORARY_ELEMENTS.delete(board);
}

export function createSelectionRectangleG(board: PlaitBoard) {
    const elements = getSelectedElements(board);
    const rectangle = getRectangleByElements(board, elements, false);
    if (rectangle.width > 0 && rectangle.height > 0 && elements.length > 1) {
        const selectionRectangleG = drawRectangle(board, RectangleClient.inflate(rectangle, ACTIVE_STROKE_WIDTH), {
            stroke: SELECTION_BORDER_COLOR,
            strokeWidth: ACTIVE_STROKE_WIDTH,
            fillStyle: 'solid'
        });
        selectionRectangleG.classList.add(SELECTION_RECTANGLE_CLASS_NAME);
        PlaitBoard.getElementActiveHost(board).append(selectionRectangleG);
        const angle = getSelectionAngle(elements);
        if (angle) {
            setAngleForG(selectionRectangleG, RectangleClient.getCenterPoint(rectangle), angle);
        }
        return selectionRectangleG;
    }
    return null;
}
