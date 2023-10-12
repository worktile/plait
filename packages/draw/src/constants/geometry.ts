import { ACTIVE_STROKE_WIDTH } from '@plait/core';

export const ShapeDefaultSpace = {
    rectangleAndText: 4
};

export const DefaultGeometryStyle = {
    strokeWidth: 2,
    defaultRadius: 4,
    strokeColor: '#000',
    fill: 'none'
};

export const DefaultGeometryActiveStyle = {
    strokeWidth: ACTIVE_STROKE_WIDTH,
    selectionStrokeWidth: ACTIVE_STROKE_WIDTH
};

export const DefaultGeometryProperty = {
    width: 100,
    height: 100,
    strokeColor: '#333',
    strokeWidth: 2
};

export const DefaultTextProperty = {
    width: 36,
    height: 20,
    text: '文本'
};

export const GeometryThreshold = {
    defaultTextMaxWidth: 34 * 14
};
