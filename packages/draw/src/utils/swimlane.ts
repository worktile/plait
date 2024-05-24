import { idCreator, Point, RectangleClient } from '@plait/core';
import { DEFAULT_TEXT_HEIGHT, DrawPointerType, DefaultSwimlanePropertyMap } from '../constants';
import { PlaitDrawElement, PlaitSwimlane, SwimlaneSymbols } from '../interfaces';

export function buildSwimlaneTable(element: PlaitSwimlane) {
    const swimlaneElement = { ...element };
    if (PlaitDrawElement.isHorizontalSwimlane(element)) {
        swimlaneElement.cells = element.cells.map((item, index) => {
            if (index === 0) {
                item = {
                    ...element.cells[0],
                    rowspan: element.rows.length
                };
            }
            if (item.text && item.textHeight && !item.text.direction) {
                item.text.direction = 'vertical';
            }
            return item;
        });
        return swimlaneElement;
    }
    swimlaneElement.cells = [
        {
            ...element.cells[0],
            colspan: element.columns.length
        },
        ...element.cells.slice(1, element.cells.length)
    ];
    return swimlaneElement;
}

export const getDefaultSWimlanePoints = (pointer: DrawPointerType, centerPoint: Point) => {
    const property = DefaultSwimlanePropertyMap[pointer];
    return RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(centerPoint, property.width, property.height));
};

export const createDefaultSwimlane = (shape: SwimlaneSymbols, points: [Point, Point]) => {
    const rows = createDefaultRowsOrColumns(shape, 'row');
    const columns = createDefaultRowsOrColumns(shape, 'column');
    const swimlane = {
        id: idCreator(),
        type: 'table',
        shape,
        points,
        rows,
        columns,
        cells: createDefaultCells(shape, rows, columns)
    } as PlaitSwimlane;
    return buildSwimlaneTable(swimlane);
};

export const createDefaultRowsOrColumns = (shape: SwimlaneSymbols, type: 'row' | 'column') => {
    let data = new Array(3).fill('').map(item => {
        return { id: idCreator() };
    });
    if (type === 'row' && shape === SwimlaneSymbols.swimlaneVertical) {
        data = data.map((item, index) => {
            if (index === 0 || index === 1) {
                return {
                    ...item,
                    height: 30
                };
            }
            return item;
        });
    }
    if (type === 'column' && shape === SwimlaneSymbols.swimlaneHorizontal) {
        data = data.map((item, index) => {
            if (index === 0 || index === 1) {
                return {
                    ...item,
                    width: 30
                };
            }
            return item;
        });
    }
    return data;
};

export const createDefaultCells = (
    shape: SwimlaneSymbols,
    rows: { id: string; height?: number }[],
    columns: { id: string; width?: number }[]
) => {
    return new Array(7).fill('').map((item, index) => {
        if (index === 0) {
            item = {
                id: idCreator(),
                rowId: rows[0].id,
                columnId: columns[0].id,
                textHeight: DEFAULT_TEXT_HEIGHT,
                text: {
                    children: [
                        {
                            text: 'New Swimlane'
                        }
                    ],
                    align: 'center'
                }
            };
        }
        if ([1, 2, 3].includes(index)) {
            item = {
                id: idCreator(),
                rowId: shape === SwimlaneSymbols.swimlaneVertical ? rows[1].id : rows[index - 1].id,
                columnId: shape === SwimlaneSymbols.swimlaneVertical ? columns[index - 1].id : columns[1].id,
                textHeight: DEFAULT_TEXT_HEIGHT,
                text: {
                    children: [
                        {
                            text: 'Lane'
                        }
                    ],
                    align: 'center'
                }
            };
        }
        if ([4, 5, 6].includes(index)) {
            item = {
                id: idCreator(),
                rowId: shape === SwimlaneSymbols.swimlaneVertical ? rows[2].id : rows[index - 4].id,
                columnId: shape === SwimlaneSymbols.swimlaneVertical ? columns[index - 4].id : columns[2].id
            };
        }
        return item;
    });
};
