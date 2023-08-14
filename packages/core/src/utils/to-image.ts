import { PlaitBoard } from '../interfaces';
import { getRectangleByElements } from './element';

export interface ToImageOptions {
    name?: string;
    ratio?: number;
    padding?: number;
    fillStyle?: string;
    // 逗号类名列表。 该列表必须采用 class1,class2,... 的形式。
    inlineStyleClassNames?: string;
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

function cloneSvg(board: PlaitBoard, options: ToImageOptions) {
    const elementHostBox = getRectangleByElements(board, board.children, true);
    const { width, height, x, y } = elementHostBox;
    const { padding = 4, inlineStyleClassNames } = options;
    const sourceSvg = PlaitBoard.getHost(board);
    const cloneSvgElement = sourceSvg.cloneNode(true) as SVGElement;

    cloneSvgElement.style.width = `${width}px`;
    cloneSvgElement.style.height = `${height}px`;
    cloneSvgElement.style.backgroundColor = '';
    cloneSvgElement.setAttribute('width', `${width}`);
    cloneSvgElement.setAttribute('height', `${height}`);
    cloneSvgElement.setAttribute('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(','));

    if (inlineStyleClassNames) {
        const sourceNodes = Array.from(sourceSvg.querySelectorAll(inlineStyleClassNames));
        const cloneNodes = Array.from(cloneSvgElement.querySelectorAll(inlineStyleClassNames));

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
    }

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

export async function toImage(board: PlaitBoard, options: ToImageOptions): Promise<string | undefined> {
    if (!board) {
        return undefined;
    }

    const elementHostBox = getRectangleByElements(board, board.children, true);
    const { ratio = 2, fillStyle = 'transparent' } = options;
    const { width, height } = elementHostBox;
    const ratioWidth = width * ratio;
    const ratioHeight = height * ratio;
    const cloneSvgElement = cloneSvg(board, options);
    const { canvas, ctx } = createCanvas(ratioWidth, ratioHeight, fillStyle);

    const svgStr = new XMLSerializer().serializeToString(cloneSvgElement);
    const imgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;

    try {
        const img = await loadImage(imgSrc);
        ctx.drawImage(img, 0, 0, ratioWidth, ratioHeight);
        const url = canvas.toDataURL('image/png');
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
