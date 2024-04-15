import { ACTIVE_STROKE_WIDTH } from '@plait/core';
import { FlowchartSymbols } from '../interfaces';

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

export const DefaultCloudShapeProperty = {
    width: 120,
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

export const DefaultConnectorProperty = {
    width: 44,
    height: 44
};

export const DefaultFlowchartProperty = {
    width: 120,
    height: 60
};

export const DefaultDecisionProperty = {
    width: 140,
    height: 70
};

export const DefaultDataProperty = {
    width: 124,
    height: 60
};

export const DefaultManualInputProperty = {
    width: 117,
    height: 59
};

export const DefaultMergeProperty = {
    width: 47,
    height: 33
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
    [FlowchartSymbols.predefinedProcess]: DefaultFlowchartProperty,
    [FlowchartSymbols.offPage]: DefaultFlowchartProperty
};

export const LINE_HIT_GEOMETRY_BUFFER = 10;

export const LINE_SNAPPING_BUFFER = 6;

export const LINE_SNAPPING_CONNECTOR_BUFFER = 8;
