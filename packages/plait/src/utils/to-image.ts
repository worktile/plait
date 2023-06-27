import { PlaitBoard } from '../interfaces';
import { getRectangleByElements } from './element';

export interface ConvertOptions {
    svg: SVGElement;
    name?: string;
    suffix?: string;
    ratio?: number;
    padding?: number;
    fillStyle?: string;
    // 逗号分隔的标签名称列表。 该列表必须采用 tag1,tag2,... 的形式。
    // 原子标记是需要复制其子节点样式的标记 - 整个标记下的所有子元素将会以复制样式的方式处理样式展示问题。 如果不使用，将使用默认列表：extend、emojis、text。
    atomicTags?: string;
}

function cloneCSSStyle<T extends HTMLElement>(nativeNode: T, clonedNode: T) {
    const targetStyle = clonedNode.style;
    if (!targetStyle) {
        return;
    }

    const sourceStyle = window.getComputedStyle(nativeNode);
    if (sourceStyle.cssText) {
        targetStyle.cssText = sourceStyle.cssText;
        targetStyle.transformOrigin = sourceStyle.transformOrigin;
    } else {
        Array.from(sourceStyle).forEach(name => {
            let value = sourceStyle.getPropertyValue(name);
            targetStyle.setProperty(name, value, sourceStyle.getPropertyPriority(name));
        });
    }
}

function createCanvas(width: number, height: number, fillStyle: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0, 0, width, height);

    return {
        canvas,
        ctx
    };
}

function isElementNode(node: Node): node is HTMLElement {
    return node.nodeType === Node.ELEMENT_NODE;
}

function cloneSvg(board: PlaitBoard, options: ConvertOptions) {
    const elementHostBox = getRectangleByElements(board, board.children, true);
    const { width, height, x, y } = elementHostBox;
    const { svg, padding = 4, atomicTags = '.extend,.emojis,.text' } = options;
    const cloneSvgElement = svg.cloneNode(true) as SVGElement;

    cloneSvgElement.style.width = `${width}px`;
    cloneSvgElement.style.height = `${height}px`;
    cloneSvgElement.style.backgroundColor = '';
    cloneSvgElement.setAttribute('width', `${width}`);
    cloneSvgElement.setAttribute('height', `${height}`);
    cloneSvgElement.setAttribute('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(','));

    const sourceNodes = Array.from(svg.querySelectorAll(atomicTags));
    const cloneNodes = Array.from(cloneSvgElement.querySelectorAll(atomicTags));

    // 把指定元素的样式转化成行内样式一一对应到克隆元素上
    sourceNodes.forEach((node, index) => {
        const cloneNode = cloneNodes[index];
        const childElements = Array.from(node.querySelectorAll('*')).filter(isElementNode) as HTMLElement[];
        const cloneChildElements = Array.from(cloneNode.querySelectorAll('*')).filter(isElementNode) as HTMLElement[];
        sourceNodes.push(...childElements);
        cloneNodes.push(...cloneChildElements);
    });
    sourceNodes.forEach((node, index) => {
        const cloneNode = cloneNodes[index];
        cloneCSSStyle(node as HTMLElement, cloneNode as HTMLElement);
    });

    return cloneSvgElement;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
}

export async function toImage(board: PlaitBoard, options: ConvertOptions): Promise<string | undefined> {
    if (!board || !options.svg) {
        return undefined;
    }

    const elementHostBox = getRectangleByElements(board, board.children, true);
    const { suffix = 'jpg', ratio = 2, fillStyle = '#ffffff' } = options;
    const { width, height } = elementHostBox;
    const ratioWidth = width * ratio;
    const ratioHeight = height * ratio;
    const cloneSvgElement = cloneSvg(board, options);
    const canvasFillStyle = suffix === 'jpg' ? fillStyle : 'transparent';
    const { canvas, ctx } = createCanvas(ratioWidth, ratioHeight, canvasFillStyle);

    const svgStr = new XMLSerializer().serializeToString(cloneSvgElement);
    const imgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;

    try {
        const img = await loadImage(imgSrc);
        ctx.drawImage(img, 0, 0, ratioWidth, ratioHeight);
        const url = canvas.toDataURL(`image/${suffix}`);
        return url;
    } catch (error) {
        console.error('Error converting SVG to image:', error);
        return undefined;
    }
}

export function downloadImage(url: string, name: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    a.remove();
}
