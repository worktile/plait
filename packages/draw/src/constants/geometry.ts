import { ACTIVE_STROKE_WIDTH } from '@plait/core';
import { Alignment } from '@plait/text';
import {
    BasicShapes,
    FlowchartSymbols,
    GeometryShapes,
    MultipleTextGeometryCommonTextKeys,
    SwimlaneSymbols,
    UMLSymbols
} from '../interfaces';

export const ShapeDefaultSpace = {
    rectangleAndText: 4
};

export const DefaultDrawStyle = {
    strokeWidth: 2,
    defaultRadius: 4,
    strokeColor: '#000',
    fill: 'none'
};

export const DefaultDrawActiveStyle = {
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

export const DefaultActorProperty = {
    width: 68,
    height: 100
};

export const DefaultContainerProperty = {
    width: 300,
    height: 240
};

export const DefaultPackageProperty = {
    width: 210,
    height: 150,
    texts: [
        {
            key: MultipleTextGeometryCommonTextKeys.name,
            text: '包名',
            align: Alignment.left
        },
        {
            key: MultipleTextGeometryCommonTextKeys.content,
            text: '',
            align: Alignment.left
        }
    ]
};

export const DefaultActivationProperty = {
    width: 18,
    height: 80
};

export const DefaultObjectProperty = {
    width: 120,
    height: 60
};

export const DefaultDeletionProperty = {
    width: 40,
    height: 40
};

export const DefaultCombinedFragmentProperty = {
    width: 400,
    height: 280,
    texts: [
        {
            key: MultipleTextGeometryCommonTextKeys.name,
            text: 'Opt | Alt | Loop',
            align: Alignment.left
        },
        {
            key: MultipleTextGeometryCommonTextKeys.content,
            text: '[Condition]',
            align: Alignment.left
        }
    ]
};

export const DefaultSwimlaneVerticalProperty = {
    width: 450,
    height: 500
};

export const DefaultSwimlaneHorizontalProperty = {
    width: 500,
    height: 450
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
    [FlowchartSymbols.noteSquare]: DefaultNoteProperty,
    [FlowchartSymbols.display]: DefaultFlowchartProperty
};

export const DefaultUMLPropertyMap = {
    [UMLSymbols.actor]: DefaultActorProperty,
    [UMLSymbols.useCase]: DefaultDocumentProperty,
    [UMLSymbols.container]: DefaultContainerProperty,
    [UMLSymbols.package]: DefaultPackageProperty,
    [UMLSymbols.combinedFragment]: DefaultCombinedFragmentProperty,
    [UMLSymbols.activation]: DefaultActivationProperty,
    [UMLSymbols.object]: DefaultObjectProperty,
    [UMLSymbols.deletion]: DefaultDeletionProperty
};

export const MultipleTextGeometryTextKeys: { [key in GeometryShapes]?: string[] } = {
    [UMLSymbols.package]: Object.keys(MultipleTextGeometryCommonTextKeys),
    [UMLSymbols.combinedFragment]: Object.keys(MultipleTextGeometryCommonTextKeys)
};

export const DefaultSwimlanePropertyMap: Record<string, { width: number; height: number }> = {
    [SwimlaneSymbols.swimlaneHorizontal]: DefaultSwimlaneHorizontalProperty,
    [SwimlaneSymbols.swimlaneVertical]: DefaultSwimlaneVerticalProperty
};

export const LINE_HIT_GEOMETRY_BUFFER = 10;

export const LINE_SNAPPING_BUFFER = 6;

export const LINE_SNAPPING_CONNECTOR_BUFFER = 8;

export const GEOMETRY_WITHOUT_TEXT = [
    FlowchartSymbols.or,
    FlowchartSymbols.summingJunction,
    UMLSymbols.activation,
    UMLSymbols.deletion
] as GeometryShapes[];

export const GEOMETRY_WITH_MULTIPLE_TEXT = [UMLSymbols.package, UMLSymbols.combinedFragment];
