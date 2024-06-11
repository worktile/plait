import { idCreator, Point, RectangleClient } from '@plait/core';
import { DefaultSwimlanePropertyMap, SWIMLANE_HEADER_SIZE } from '../constants';
import { PlaitDrawElement, PlaitSwimlane, PlaitTableCell, SwimlaneDrawSymbols, SwimlaneSymbols } from '../interfaces';
import { createCell } from './table';

export function buildSwimlaneTable(element: PlaitSwimlane) {
    const swimlaneElement = { ...element };
    if (PlaitDrawElement.isHorizontalSwimlane(element)) {
        swimlaneElement.cells = element.cells.map((item, index) => {
            if (index === 0 && element.header) {
                item = {
                    ...element.cells[0],
                    rowspan: element.rows.length
                };
            }
            if (item.text && item.textHeight && !item.text.direction) {
                item = {
                    ...item,
                    text: {
                        ...item.text,
                        direction: 'vertical'
                    }
                };
            }
            return item;
        });

        return swimlaneElement;
    }
    if (element.header) {
        swimlaneElement.cells = [
            {
                ...element.cells[0],
                colspan: element.columns.length
            },
            ...element.cells.slice(1, element.cells.length)
        ];
    }
    return swimlaneElement;
}

export const getDefaultSwimlanePoints = (pointer: SwimlaneDrawSymbols, centerPoint: Point) => {
    const property = DefaultSwimlanePropertyMap[pointer];
    return RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(centerPoint, property.width, property.height));
};

export const createDefaultSwimlane = (shape: SwimlaneDrawSymbols, points: [Point, Point]) => {
    const header = isSwimlaneWithHeader(shape);
    const dataShape = adjustSwimlaneShape(shape);
    const rows = createDefaultRowsOrColumns(dataShape, 'row', header);
    const columns = createDefaultRowsOrColumns(dataShape, 'column', header);
    const swimlane = {
        id: idCreator(),
        type: 'swimlane',
        shape: dataShape,
        points,
        rows,
        columns,
        header,
        cells: createDefaultCells(dataShape, rows, columns, header)
    } as PlaitSwimlane;
    return swimlane;
};

export const createDefaultRowsOrColumns = (shape: SwimlaneSymbols, type: 'row' | 'column', header: boolean) => {
    const createItems = (count: number) => new Array(count).fill('').map(() => ({ id: idCreator() }));
    let data = createItems(3);
    if (
        (type === 'row' && shape === SwimlaneSymbols.swimlaneVertical) ||
        (type === 'column' && shape === SwimlaneSymbols.swimlaneHorizontal)
    ) {
        data = header ? data : createItems(2);
        const dimension = type === 'row' ? 'height' : 'width';
        data = data.map((item, index) => {
            if (index === 0 || (index === 1 && header)) {
                return {
                    ...item,
                    [dimension]: SWIMLANE_HEADER_SIZE
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
    columns: { id: string; width?: number }[],
    header: boolean
) => {
    let headerCell: PlaitTableCell[] = [];
    let startIndex = 0;
    if (header) {
        headerCell = [createCell(rows[0].id, columns[0].id, 'New Swimlane')];
        startIndex = 1;
    }
    const cells = new Array(6).fill('').map((_, index) => {
        if (index < 3) {
            const rowId = shape === SwimlaneSymbols.swimlaneVertical ? rows[startIndex].id : rows[index].id;
            const columnId = shape === SwimlaneSymbols.swimlaneVertical ? columns[index].id : columns[startIndex].id;
            return createCell(rowId, columnId, 'Lane');
        }
        const rowId = shape === SwimlaneSymbols.swimlaneVertical ? rows[startIndex + 1].id : rows[index - 3].id;
        const columnId = shape === SwimlaneSymbols.swimlaneVertical ? columns[index - 3].id : columns[startIndex + 1].id;
        return createCell(rowId, columnId);
    });
    return [...headerCell, ...cells];
};

export const getSwimlaneCount = (swimlane: PlaitSwimlane) => {
    if (PlaitDrawElement.isHorizontalSwimlane(swimlane)) {
        return swimlane.rows.length;
    }
    if (PlaitDrawElement.isVerticalSwimlane(swimlane)) {
        return swimlane.columns.length;
    }
    return 0;
};

export const isSwimlaneWithHeader = (shape: SwimlaneDrawSymbols) => {
    return [SwimlaneDrawSymbols.swimlaneHorizontalWithHeader, SwimlaneDrawSymbols.swimlaneVerticalWithHeader].includes(shape);
};

export const adjustSwimlaneShape = (shape: SwimlaneDrawSymbols): SwimlaneSymbols => {
    return [SwimlaneDrawSymbols.swimlaneHorizontalWithHeader, SwimlaneDrawSymbols.swimlaneHorizontal].includes(shape)
        ? SwimlaneSymbols.swimlaneHorizontal
        : SwimlaneSymbols.swimlaneVertical;
};
