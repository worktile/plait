import { PlaitBoard, Point, idCreator } from '@plait/core';
import { DefaultTextProperty, DefaultBasicShapeProperty } from '../constants';
import { GeometryShapes, UMLSymbols, PlaitCommonGeometry } from '../interfaces';
import { getMemorizedLatestByPointer } from './memorize';
import { GeometryStyleOptions, getDefaultGeometryProperty, getTextShapeProperty } from './geometry';

export const createUMLClassOrInterfaceGeometryElement = (board: PlaitBoard, shape: GeometryShapes, points: [Point, Point]) => {
    const memorizedLatest = getMemorizedLatestByPointer(shape);
    const defaultTexts = (getDefaultGeometryProperty(shape) as any)?.texts || [];
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
        const testHeights = defaultTexts.map((textItem: { text: string }) => {
            return getTextShapeProperty(board, textItem.text || DefaultTextProperty.text, memorizedLatest.textProperties['font-size'])
                .height;
        });

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
                    textHeight: testHeights[0],
                    text: {
                        children: [
                            {
                                text: defaultTexts[0].text
                            }
                        ],
                        align: defaultTexts[0].align
                    }
                },
                {
                    id: cellIds[1],
                    rowId: rowIds[1],
                    textHeight: testHeights[1],
                    columnId: columnIds[0],
                    text: {
                        children: [
                            {
                                text: defaultTexts[1].text
                            }
                        ],
                        align: defaultTexts[1].align
                    }
                },
                {
                    id: cellIds[2],
                    rowId: rowIds[2],
                    textHeight: testHeights[2],
                    columnId: columnIds[0],
                    text: {
                        children: [
                            {
                                text: defaultTexts[2].text
                            }
                        ],
                        align: defaultTexts[2].align
                    }
                }
            ]
        } as unknown) as PlaitCommonGeometry;
    } else {
        const rowIds = [idCreator(), idCreator()];
        const columnIds = [idCreator()];
        const cellIds = [idCreator(), idCreator()];
        const testHeights = defaultTexts.map((textItem: { text: string }) => {
            return getTextShapeProperty(board, textItem.text || DefaultTextProperty.text, memorizedLatest.textProperties['font-size'])
                .height;
        });
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
                    textHeight: testHeights[0],
                    text: {
                        children: [
                            {
                                text: defaultTexts[0].text
                            }
                        ],
                        align: defaultTexts[0].align
                    }
                },
                {
                    id: cellIds[1],
                    rowId: rowIds[1],
                    textHeight: testHeights[1],
                    columnId: columnIds[0],
                    text: {
                        children: [
                            {
                                text: defaultTexts[1].text
                            }
                        ],
                        align: defaultTexts[1].align
                    }
                }
            ]
        } as unknown) as PlaitCommonGeometry;
    }
};
