import { PlaitBoard, Point, idCreator } from '@plait/core';
import { DefaultBasicShapeProperty } from '../constants';
import { GeometryShapes, UMLSymbols, PlaitCommonGeometry } from '../interfaces';
import { getMemorizedLatestByPointer } from './memorize';
import { GeometryStyleOptions, getDefaultGeometryProperty, getTextShapeProperty } from './geometry';
import { PlaitTableCell } from '../interfaces/table';
import { getDefaultGeometryText } from './common';

export const createUMLClassOrInterfaceGeometryElement = (board: PlaitBoard, shape: GeometryShapes, points: [Point, Point]) => {
    const memorizedLatest = getMemorizedLatestByPointer(shape);
    const element = {
        id: idCreator(),
        type: 'geometry',
        angle: 0,
        opacity: 1,
        points,
        strokeWidth: DefaultBasicShapeProperty.strokeWidth,
        ...(memorizedLatest.geometryProperties as GeometryStyleOptions)
    };
    let rows: { id: string; height?: number }[];
    let columns: { id: string; height?: number }[];
    if (shape === UMLSymbols.class) {
        rows = [
            {
                id: idCreator(),
                height: 30
            },
            {
                id: idCreator()
            },
            {
                id: idCreator()
            }
        ];
        columns = [
            {
                id: idCreator()
            }
        ];
    } else {
        rows = [
            {
                id: idCreator(),
                height: 50
            },
            {
                id: idCreator()
            }
        ];
        columns = [
            {
                id: idCreator()
            }
        ];
    }
    return {
        ...element,
        shape,
        rows,
        columns,
        cells: buildTableCellsForGeometry(board, rows, columns, shape)
    } as unknown as PlaitCommonGeometry;
};

const buildTableCellsForGeometry = (
    board: PlaitBoard,
    rows: {
        id: string;
        height?: number;
    }[],
    columns: {
        id: string;
        height?: number;
    }[],
    shape: GeometryShapes
): PlaitTableCell[] => {
    const cellCount = rows.length * columns.length;
    const defaultTexts = (getDefaultGeometryProperty(shape) as any)?.texts || [];
    return new Array(cellCount).fill('').map((item, index) => {
        const rowIndex = Math.floor(index / columns.length);
        const columnIndex = index % columns.length;
        return {
            id: idCreator(),
            rowId: rows[rowIndex].id,
            columnId: columns[columnIndex].id,
            text: {
                children: [
                    {
                        text: defaultTexts[index].text
                    }
                ],
                align: defaultTexts[index].align
            }
        };
    });
};
