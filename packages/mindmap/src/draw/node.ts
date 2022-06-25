import { RoughSVG } from 'roughjs/bin/svg';
import { MindmapNode } from '../interfaces/node';
import { drawRoundRectangle, getRectangleByNode } from '../utils/graph';

const color = '#e67700';

export function drawNode(roughSVG: RoughSVG, node: MindmapNode) {
    const { x, y, width, height } = getRectangleByNode(node);

    const nodeG = drawRoundRectangle(roughSVG, x, y, x + width, y + height, { stroke: color, fill: 'white', fillStyle: 'solid' });

    return nodeG;
}
