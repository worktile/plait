import { ACTIVE_STROKE_WIDTH } from '@plait/core';
import { BasicShapes, FlowchartSymbols } from '../interfaces';

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

export const DefaultBasicShapeProperty = {
    width: 100,
    height: 100,
    strokeColor: '#333',
    strokeWidth: 2
};

export const DefaultPentagonArrowProperty = {
    width: 120,
    height: 50
};

export const DefaultTwoWayArrowProperty = {
    width: 138,
    height: 80
};

export const DefaultArrowProperty = {
    width: 100,
    height: 80
};

export const DefaultCloudProperty = {
    width: 120,
    height: 100
};

export const DefaultTextProperty = {
    width: 36,
    height: 20,
    text: '文本'
};

export const GeometryThreshold = {
    defaultTextMaxWidth: 34 * 14
};

export const DefaultConnectorProperty = {
    width: 44,
    height: 44
};

export const DefaultFlowchartProperty = {
    width: 120,
    height: 60
};

export const DefaultDataBaseProperty = {
    width: 70,
    height: 80
};

export const DefaultInternalStorageProperty = {
    width: 80,
    height: 80
};

export const DefaultDecisionProperty = {
    width: 140,
    height: 70
};

export const DefaultDataProperty = {
    width: 124,
    height: 60
};

export const DefaultDocumentProperty = {
    width: 120,
    height: 70
};

export const DefaultNoteProperty = {
    width: 160,
    height: 100
};

export const DefaultMultiDocumentProperty = {
    width: 120,
    height: 80
};

export const DefaultManualInputProperty = {
    width: 117,
    height: 59
};

export const DefaultMergeProperty = {
    width: 47,
    height: 33
};

export const DefaultBasicShapePropertyMap: Record<string, { width: number; height: number }> = {
    [BasicShapes.pentagonArrow]: DefaultPentagonArrowProperty,
    [BasicShapes.processArrow]: DefaultPentagonArrowProperty,
    [BasicShapes.cloud]: DefaultCloudProperty,
    [BasicShapes.twoWayArrow]: DefaultTwoWayArrowProperty,
    [BasicShapes.leftArrow]: DefaultArrowProperty,
    [BasicShapes.rightArrow]: DefaultArrowProperty
};

export const DefaultFlowchartPropertyMap = {
    [FlowchartSymbols.connector]: DefaultConnectorProperty,
    [FlowchartSymbols.process]: DefaultFlowchartProperty,
    [FlowchartSymbols.decision]: DefaultDecisionProperty,
    [FlowchartSymbols.data]: DefaultDataProperty,
    [FlowchartSymbols.terminal]: DefaultFlowchartProperty,
    [FlowchartSymbols.manualInput]: DefaultManualInputProperty,
    [FlowchartSymbols.preparation]: DefaultFlowchartProperty,
    [FlowchartSymbols.manualLoop]: DefaultFlowchartProperty,
    [FlowchartSymbols.merge]: DefaultMergeProperty,
    [FlowchartSymbols.delay]: DefaultFlowchartProperty,
    [FlowchartSymbols.storedData]: DefaultFlowchartProperty,
    [FlowchartSymbols.or]: DefaultConnectorProperty,
    [FlowchartSymbols.summingJunction]: DefaultConnectorProperty,
    [FlowchartSymbols.predefinedProcess]: DefaultFlowchartProperty,
    [FlowchartSymbols.offPage]: DefaultFlowchartProperty,
    [FlowchartSymbols.document]: DefaultDocumentProperty,
    [FlowchartSymbols.multiDocument]: DefaultMultiDocumentProperty,
    [FlowchartSymbols.database]: DefaultDataBaseProperty,
    [FlowchartSymbols.hardDisk]: DefaultFlowchartProperty,
    [FlowchartSymbols.internalStorage]: DefaultInternalStorageProperty,
    [FlowchartSymbols.noteCurlyLeft]: DefaultNoteProperty,
    [FlowchartSymbols.noteCurlyRight]: DefaultNoteProperty,
    [FlowchartSymbols.noteSquare]: DefaultNoteProperty
};

export const LINE_HIT_GEOMETRY_BUFFER = 10;

export const LINE_SNAPPING_BUFFER = 6;

export const LINE_SNAPPING_CONNECTOR_BUFFER = 8;
