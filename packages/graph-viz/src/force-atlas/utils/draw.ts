import { EdgeDirection, NodeStyles } from '../types';
import { PlaitBoard, Point, createForeignObject, createG, createPath, drawCircle, normalizePoint } from '@plait/core';
import getArrow from '../../perfect-arrows/get-arrow';
import {
    ACTIVE_BACKGROUND_NODE_ALPHA,
    DEFAULT_ACTIVE_NODE_SIZE_MULTIPLIER,
    DEFAULT_ACTIVE_WAVE_NODE_SIZE_MULTIPLIER,
    DEFAULT_EDGE_PARTICLE_SIZE,
    DEFAULT_LINE_STYLES,
    DEFAULT_NODE_LABEL_HEIGHT,
    DEFAULT_NODE_LABEL_STYLE,
    DEFAULT_NODE_LABEL_WIDTH,
    DEFAULT_NODE_SIZE,
    DEFAULT_NODE_STYLES,
    NODE_LABEL_CLASS_NAME,
    SECOND_DEPTH_NODE_ALPHA
} from '../constants';
import { DEFAULT_STYLES } from '../../constants/default';
import { ForceAtlasNodeElement } from '../../interfaces';

export function drawNode(
    board: PlaitBoard,
    node: ForceAtlasNodeElement,
    point: Point,
    options: { iconG?: SVGGElement; isActive: boolean; opacity?: number }
) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const nodeStyles: NodeStyles = {
        ...DEFAULT_NODE_STYLES,
        ...(node.styles || {})
    };
    let { x, y } = normalizePoint(point);
    let diameter = node.size ?? DEFAULT_NODE_SIZE;
    if (options.isActive) {
        diameter = diameter * DEFAULT_ACTIVE_NODE_SIZE_MULTIPLIER;
    }
    const nodeG = drawCircle(roughSVG, [x, y], diameter, nodeStyles);
    const labelWidth = node.styles?.labelWidth ?? DEFAULT_NODE_LABEL_WIDTH;
    const labelHeight = node.styles?.labelHeight ?? DEFAULT_NODE_LABEL_HEIGHT;
    const textForeignObject = createForeignObject(x - labelWidth / 2, y, labelWidth, labelHeight);
    const textContainer = document.createElement('div');
    textContainer.classList.add(NODE_LABEL_CLASS_NAME);
    textContainer.setAttribute('style', DEFAULT_NODE_LABEL_STYLE);
    const text = document.createElement('span');
    text.innerText = node.label;
    textContainer.append(text);
    textForeignObject.append(textContainer);
    if (options.isActive) {
        const waveDiameter = diameter * DEFAULT_ACTIVE_WAVE_NODE_SIZE_MULTIPLIER;
        const waveCircle = drawCircle(roughSVG, [x, y], waveDiameter, nodeStyles);
        waveCircle.setAttribute('opacity', ACTIVE_BACKGROUND_NODE_ALPHA.toString());
        nodeG.append(waveCircle);
        textForeignObject.setAttribute('y', `${y + waveDiameter / 2}`);
    } else {
        textForeignObject.setAttribute('y', `${y + diameter / 2}`);
        nodeG.setAttribute('opacity', (options.opacity ?? 1).toString());
    }
    if (options.iconG) {
        nodeG.append(options.iconG);
    }
    nodeG.append(textForeignObject);
    return nodeG;
}

export function drawEdge(startPoint: Point, endPoint: Point, direction: EdgeDirection, isMutual: boolean, isTargetSelf?: boolean) {
    const nodeRadius = DEFAULT_NODE_SIZE / 2;
    const arrow = getArrow(startPoint[0], startPoint[1], endPoint[0], endPoint[1], {
        stretch: 0.4,
        flip: direction === EdgeDirection.NONE ? false : isMutual,
        padEnd: nodeRadius,
        padStart: nodeRadius
    });
    const [sx, sy, cx, cy, ex, ey, ae, as, ec] = arrow;
    const g = createG();
    const path = createPath();
    if (!isTargetSelf) {
        path.setAttribute('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);
    } else {
        const x = startPoint[0];
        const y = startPoint[1];
        const besselX = 40;
        const besselY = 75;
        const angle = 55;
        const angleRad = (angle * Math.PI) / 180;
        const offsetX = nodeRadius * Math.cos(angleRad);
        const offsetY = nodeRadius * Math.sin(angleRad);
        path.setAttribute(
            'd',
            `M ${x - offsetX},${y - offsetY}
            C ${x - besselX},${y - besselY}, ${x + besselX} ${y - besselY}
            ${x + offsetX},${y - offsetY}`
        );
    }
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', DEFAULT_LINE_STYLES.color[direction]);
    path.setAttribute('opacity', DEFAULT_LINE_STYLES.opacity.toString());
    g.append(path);
    return {
        g,
        path
    };
}

export function drawParticle(board: PlaitBoard, startPoint: Point, direction: EdgeDirection) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const pointG = drawCircle(roughSVG, [0, 0], DEFAULT_EDGE_PARTICLE_SIZE, {
        ...DEFAULT_STYLES,
        strokeWidth: 0,
        fill: DEFAULT_LINE_STYLES.color[direction]
    });
    pointG.setAttribute('transform', `translate(${startPoint[0]}, ${startPoint[1]})`);
    return pointG;
}
