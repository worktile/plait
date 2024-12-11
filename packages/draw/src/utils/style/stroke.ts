import { PlaitDrawElement } from '../../interfaces';
import { DefaultDrawStyle } from '../../constants';
import { PlaitBoard, PlaitElement } from '@plait/core';
import { getDrawDefaultStrokeColor, getFlowchartDefaultFill } from '../geometry';
import { isClosedDrawElement } from '../common';
import { StrokeStyle } from '@plait/common';

export const getStrokeColorByElement = (board: PlaitBoard, element: PlaitElement) => {
    const defaultColor = getDrawDefaultStrokeColor(board.theme.themeColorMode);
    const strokeColor = element.strokeColor || defaultColor;
    return strokeColor;
};

export const getFillByElement = (board: PlaitBoard, element: PlaitElement) => {
    const defaultFill =
        PlaitDrawElement.isFlowchart(element) && isClosedDrawElement(element as PlaitDrawElement)
            ? getFlowchartDefaultFill(board.theme.themeColorMode)
            : DefaultDrawStyle.fill;
    const fill = element.fill || defaultFill;
    return fill;
};

export const getStrokeStyleByElement = (board: PlaitBoard, element: PlaitElement) => {
    return element.strokeStyle || StrokeStyle.solid;
};
