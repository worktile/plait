import { PlaitDrawElement, PlaitSwimlane } from '../interfaces';

export function buildSwimlane(element: PlaitSwimlane) {
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
