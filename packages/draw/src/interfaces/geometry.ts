import { PlaitElement, Point } from '@plait/core';
import { ParagraphElement } from '@plait/text';
import { StrokeStyle } from './element';
import { PlaitTable } from './table';

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

export type GeometryShapes = BasicShapes | FlowchartSymbols | SwimlaneSymbols;

export interface PlaitGeometry extends PlaitElement {
    points: [Point, Point];
    type: 'geometry';
    shape: GeometryShapes;

    text: ParagraphElement;
    textHeight: number;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;

    angle: number;
    opacity: number;
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
    shape: SwimlaneSymbols;
}

export interface PlaitSwimlaneVertical extends PlaitSwimlane {
    shape: SwimlaneSymbols.swimlaneVertical;
}

export interface PlaitSwimlaneHorizontal extends PlaitSwimlane {
    shape: SwimlaneSymbols.swimlaneHorizontal;
}

export const PlaitGeometry = {};
