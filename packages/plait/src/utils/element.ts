import { PlaitElement, RectangleClient } from '../interfaces';
import { depthFirstRecursion } from './tree';

export function getRectangleByElements(elements: PlaitElement[], recursion: boolean): RectangleClient {
    const nodesRectangle: RectangleClient = {
        x: Number.MAX_VALUE,
        y: Number.MAX_VALUE,
        width: 0,
        height: 0
    };
    
    if (recursion) {
        elements.forEach(element => {
            depthFirstRecursion(element, node => {
                // 
            });
        });
    } else {
        elements.forEach(element => {
            //
        });
    }

    return nodesRectangle;
}
