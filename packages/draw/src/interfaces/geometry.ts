import { PlaitBoard, PlaitElement, Point, PointOfRectangle, RectangleClient, Vector } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { ParagraphElement } from '@plait/text';
import { StrokeStyle } from './element';
import { PlaitTable } from './table';
import { UMLDefaultTextKeys } from './uml-geometry';

export enum BasicShapes {
    rectangle = 'rectangle',
    ellipse = 'ellipse',
    diamond = 'diamond',
    roundRectangle = 'roundRectangle',
    parallelogram = 'parallelogram',
    text = 'text',
    triangle = 'triangle',
    leftArrow = 'leftArrow',
    trapezoid = 'trapezoid',
    rightArrow = 'rightArrow',
    cross = 'cross',
    star = 'star',
    pentagon = 'pentagon',
    hexagon = 'hexagon',
    octagon = 'octagon',
    pentagonArrow = 'pentagonArrow',
    processArrow = 'processArrow',
    twoWayArrow = 'twoWayArrow',
    comment = 'comment',
    roundComment = 'roundComment',
    cloud = 'cloud'
}

export enum FlowchartSymbols {
    process = 'process',
    decision = 'decision',
    data = 'data',
    connector = 'connector',
    terminal = 'terminal',
    manualInput = 'manualInput',
    preparation = 'preparation',
    manualLoop = 'manualLoop',
    merge = 'merge',
    delay = 'delay',
    storedData = 'storedData',
    or = 'or',
    summingJunction = 'summingJunction',
    predefinedProcess = 'predefinedProcess',
    offPage = 'offPage',
    document = 'document',
    multiDocument = 'multiDocument',
    database = 'database',
    hardDisk = 'hardDisk',
    internalStorage = 'internalStorage',
    noteCurlyRight = 'noteCurlyRight',
    noteCurlyLeft = 'noteCurlyLeft',
    noteSquare = 'noteSquare',
    display = 'display'
}

export enum TableSymbols {
    table = 'table'
}

export enum SwimlaneSymbols {
    swimlaneVertical = 'swimlaneVertical',
    swimlaneHorizontal = 'swimlaneHorizontal'
}

export type GeometryShapes = BasicShapes | FlowchartSymbols | SwimlaneSymbols | TableSymbols;

export type PlaitGeometryTextKeys = UMLDefaultTextKeys;

export interface PlaitGeometryText {
    key: PlaitGeometryTextKeys;
    text: ParagraphElement;
    textHeight: number;
}

export interface PlaitCommonGeometry extends PlaitElement {
    points: [Point, Point];
    type: 'geometry';
    shape: GeometryShapes;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;

    angle: number;
    opacity: number;
}

export interface PlaitMultipleTextGeometry extends PlaitCommonGeometry {
    texts?: PlaitGeometryText[];
}

export interface PlaitGeometry extends PlaitCommonGeometry {
    text: ParagraphElement;
    textHeight: number;
}

export interface PlaitRectangle extends PlaitGeometry {
    shape: BasicShapes.rectangle;
}

export interface PlaitEllipse extends PlaitGeometry {
    shape: BasicShapes.ellipse;
}

export interface PlaitDiamond extends PlaitGeometry {
    shape: BasicShapes.diamond;
}

export interface PlaitSwimlane extends PlaitTable {
    type: 'geometry';
    shape: SwimlaneSymbols;
}

export interface PlaitSwimlaneVertical extends PlaitSwimlane {
    shape: SwimlaneSymbols.swimlaneVertical;
}

export interface PlaitSwimlaneHorizontal extends PlaitSwimlane {
    shape: SwimlaneSymbols.swimlaneHorizontal;
}

export const PlaitGeometry = {};

export interface ShapeEngine {
    isInsidePoint: (rectangle: RectangleClient, point: Point) => boolean;
    getNearestPoint: (rectangle: RectangleClient, point: Point) => Point;
    getNearestCrossingPoint?: (rectangle: RectangleClient, point: Point) => Point;
    getConnectorPoints: (rectangle: RectangleClient) => Point[];
    getCornerPoints: (rectangle: RectangleClient) => Point[];
    getEdgeByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => [Point, Point] | null;
    getTangentVectorByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => Vector | null;
    draw: <T>(board: PlaitBoard, rectangle: RectangleClient, roughOptions: Options, options?: T) => SVGGElement;
    getTextRectangle?: <T>(element: PlaitGeometry, options?: T) => RectangleClient;
}
