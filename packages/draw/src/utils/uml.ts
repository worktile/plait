import { PlaitBoard, Point, idCreator } from '@plait/core';
import { Alignment } from '@plait/text';
import { DefaultTextProperty, DefaultBasicShapeProperty } from '../constants';
import { GeometryShapes, UMLSymbols, PlaitCommonGeometry } from '../interfaces';
import { getMemorizedLatestByPointer } from './memorize';
import { GeometryStyleOptions, getTextShapeProperty } from './geometry';

export const createUMLClassOrInterfaceGeometryElement = (board: PlaitBoard, shape: GeometryShapes, points: [Point, Point]) => {
    const memorizedLatest = getMemorizedLatestByPointer(shape);
    const textHeight = getTextShapeProperty(board, DefaultTextProperty.text, memorizedLatest.textProperties['font-size']).height;
    const element = {
        id: idCreator(),
        type: 'table',
        angle: 0,
        opacity: 1,
        points,
        strokeWidth: DefaultBasicShapeProperty.strokeWidth,
        ...(memorizedLatest.geometryProperties as GeometryStyleOptions)
    };

    if (shape === UMLSymbols.class) {
        const rowIds = [idCreator(), idCreator(), idCreator()];
        const columnIds = [idCreator()];
        const cellIds = [idCreator(), idCreator(), idCreator()];
        return ({
            ...element,
            shape: UMLSymbols.class,
            rows: [
                {
                    id: rowIds[0],
                    height: 30
                },
                {
                    id: rowIds[1]
                },
                {
                    id: rowIds[2]
                }
            ],
            columns: [
                {
                    id: columnIds[0]
                }
            ],
            cells: [
                {
                    id: cellIds[0],
                    rowId: rowIds[0],
                    columnId: columnIds[0],
                    textHeight: textHeight,
                    text: {
                        children: [
                            {
                                text: `Class`
                            }
                        ],
                        align: Alignment.center
                    }
                },
                {
                    id: cellIds[1],
                    rowId: rowIds[1],
                    textHeight: textHeight,
                    columnId: columnIds[0],
                    text: {
                        children: [
                            {
                                text: '+ attribute1:type  defaultValue\n+ attribute2:type\n- attribute3:type'
                            }
                        ],
                        align: Alignment.left
                    }
                },
                {
                    id: cellIds[2],
                    rowId: rowIds[2],
                    textHeight: textHeight,
                    columnId: columnIds[0],
                    text: {
                        children: [
                            {
                                text: `+ operation1(params):returnType\n- operation2(params)\n- operation3()`
                            }
                        ],
                        align: Alignment.left
                    }
                }
            ]
        } as unknown) as PlaitCommonGeometry;
    } else {
        const rowIds = [idCreator(), idCreator()];
        const columnIds = [idCreator()];
        const cellIds = [idCreator(), idCreator()];
        return ({
            ...element,
            shape: UMLSymbols.interface,
            rows: [
                {
                    id: rowIds[0],
                    height: 50
                },
                {
                    id: rowIds[1]
                }
            ],
            columns: [
                {
                    id: columnIds[0]
                }
            ],
            cells: [
                {
                    id: cellIds[0],
                    rowId: rowIds[0],
                    columnId: columnIds[0],
                    textHeight: textHeight,
                    text: {
                        children: [
                            {
                                text: `<<interface>>\nInterface`
                            }
                        ],
                        align: Alignment.center
                    }
                },
                {
                    id: cellIds[1],
                    rowId: rowIds[1],
                    textHeight: textHeight,
                    columnId: columnIds[0],
                    text: {
                        children: [
                            {
                                text: `+ operation1(params):returnType\n- operation2(params)\n- operation3()`
                            }
                        ],
                        align: Alignment.left
                    }
                }
            ]
        } as unknown) as PlaitCommonGeometry;
    }
};
