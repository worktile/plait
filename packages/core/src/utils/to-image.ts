import { PlaitBoard, PlaitElement, RectangleClient } from '../interfaces';
import { findElements, getRectangleByElements } from './element';

const FOREIGN_OBJECT_EXPRESSION = `foreignObject[class^='foreign-object']`;

export interface ToImageOptions {
    elements?: PlaitElement[];
    name?: string;
    ratio?: number;
    padding?: number;
    fillStyle?: string;
    // List of class names. The list must be in the form class1,class2,...
    inlineStyleClassNames?: string;
    styleNames?: string[];
}

/**
 * Is element node
 * @param node
 * @returns
 */
function isElementNode(node: Node): node is HTMLElement {
    return node.nodeType === Node.ELEMENT_NODE;
}

/**
 * load image resources
 * @param url image url
 * @returns image element
 */
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
}

/**
 * create and return canvas and context
 * @param width canvas width
 * @param height canvas height
 * @param fillStyle fill style
 * @returns canvas and context
 */
function createCanvas(width: number, height: number, fillStyle = 'transparent') {
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

/**
 * convert image to base64
 * @param url image url
 * @returns image base64
 */
async function convertImageToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * clone node style
 * @param nativeNode source node
 * @param clonedNode clone node
 */
function cloneCSSStyle<T extends HTMLElement>(nativeNode: T, clonedNode: T, styleNames?: string[]) {
    const targetStyle = clonedNode?.style;
    if (!targetStyle) {
        return;
    }
    const sourceStyle = window.getComputedStyle(nativeNode);
    // Only clone a subset of styles
    (styleNames || []).forEach((prop) => {
        const value = sourceStyle.getPropertyValue(prop);
        const priority = sourceStyle.getPropertyPriority(prop);
        if (value) {
            targetStyle.setProperty(prop, value, priority);
        }
    });
}

/**
 * batch clone target styles
 * @param sourceNode
 * @param cloneNode
 * @param inlineStyleClassNames
 */
function batchCloneCSSStyle(sourceNode: SVGGElement, cloneNode: SVGGElement, inlineStyleClassNames?: string, styleNames?: string[]) {
    // handle text style, Hardcoded to slate editor framework
    const textSelector = '[data-slate-node="text"]';
    const textStyle = ['font-size', 'font-family', 'line-height', 'text-decoration', 'font-weight', 'font-style', 'word-break'];
    const sourceTextNodes = Array.from(sourceNode.querySelectorAll(textSelector));
    const cloneTextNodes = Array.from(cloneNode.querySelectorAll(textSelector));
    sourceTextNodes.map((node, index) => {
        cloneCSSStyle(node as HTMLElement, cloneTextNodes[index] as HTMLElement, textStyle);
    });
    // expand
    if (inlineStyleClassNames) {
        const classNames = inlineStyleClassNames;
        const sourceNodes = Array.from(sourceNode.querySelectorAll(classNames));
        const cloneNodes = Array.from(cloneNode.querySelectorAll(classNames));
        sourceNodes.map((node, index) => {
            cloneCSSStyle(node as HTMLElement, cloneNodes[index] as HTMLElement, styleNames);
        });
    }
}

/**
 * convert images in target nodes in batches
 * @param sourceNode
 * @param cloneNode
 */
async function batchConvertImage(sourceNode: SVGGElement, cloneNode: SVGGElement) {
    const sourceImageNodes = Array.from(sourceNode.querySelectorAll(`${FOREIGN_OBJECT_EXPRESSION}`));
    const cloneImageNodes = Array.from(cloneNode.querySelectorAll(`${FOREIGN_OBJECT_EXPRESSION}`));
    await Promise.all(
        sourceImageNodes.map((_, index) => {
            return new Promise((resolve) => {
                const cloneImageNode = cloneImageNodes[index];
                // processing image
                const image = (cloneImageNode as HTMLElement).querySelector('img');
                const url = image?.getAttribute('src');
                if (!url) {
                    return resolve(true);
                }
                convertImageToBase64(url).then((base64Image) => {
                    image?.setAttribute('src', base64Image);
                    resolve(true);
                });
            });
        })
    );
}

/**
 * clone svg element
 * @param board board
 * @param options parameter configuration
 * @returns clone svg element
 */
async function cloneSvg(board: PlaitBoard, elements: PlaitElement[], rectangle: RectangleClient, options: ToImageOptions) {
    const { width, height, x, y } = rectangle;
    const { padding = 4, inlineStyleClassNames, styleNames } = options;
    const sourceSvg = PlaitBoard.getHost(board);
    const selectedGElements = elements.map((value) => PlaitElement.getElementG(value));
    const cloneSvgElement = sourceSvg.cloneNode() as SVGElement;
    const newHostElement = PlaitBoard.getElementHost(board).cloneNode() as SVGGElement;

    cloneSvgElement.style.width = `${width}px`;
    cloneSvgElement.style.height = `${height}px`;
    cloneSvgElement.style.backgroundColor = '';
    cloneSvgElement.setAttribute('width', `${width}`);
    cloneSvgElement.setAttribute('height', `${height}`);
    cloneSvgElement.setAttribute('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(','));

    const promiseArray = new Array(selectedGElements.length);
    await Promise.all(
        selectedGElements.map(async (child, i) => {
            const cloneChild = child.cloneNode(true) as SVGGElement;
            batchCloneCSSStyle(child, cloneChild, inlineStyleClassNames, styleNames);
            await batchConvertImage(child, cloneChild);
            promiseArray[i] = cloneChild;
        })
    );
    newHostElement.append(...promiseArray);
    cloneSvgElement.appendChild(newHostElement);
    return cloneSvgElement;
}

export async function toSvgData(board: PlaitBoard, options: ToImageOptions) {
    const elements = options.elements || findElements(board, { match: () => true, recursion: () => true, isReverse: false });
    const targetRectangle = getRectangleByElements(board, elements, false);
    const cloneSvgElement = await cloneSvg(board, elements, targetRectangle, options);
    const svgData = new XMLSerializer().serializeToString(cloneSvgElement);
    return svgData;
}

/**
 * current board transfer pictures
 * @param board board
 * @param options parameter configuration
 * @returns images in the specified format base64
 */
export async function toImage(board: PlaitBoard, options: ToImageOptions) {
    if (!board) {
        return undefined;
    }
    const elements = options.elements || findElements(board, { match: () => true, recursion: () => true, isReverse: false });
    const targetRectangle = getRectangleByElements(board, elements, false);
    const { ratio = 2, fillStyle = 'transparent' } = options;
    const { width, height } = targetRectangle;
    const ratioWidth = width * ratio;
    const ratioHeight = height * ratio;

    const svgData = await toSvgData(board, options);
    const { canvas, ctx } = createCanvas(ratioWidth, ratioHeight, fillStyle);
    const imgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
    try {
        const img = await loadImage(imgSrc);
        ctx.drawImage(img, 0, 0, ratioWidth, ratioHeight);
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error converting SVG to image:', error);
        return undefined;
    }
}

export async function toSvg(board: PlaitBoard, options: ToImageOptions) {
    const svgData = await toSvgData(board, options);
    return svgData;
}

/**
 * download the file with the specified name
 * @param url download url
 * @param name file name
 */
export function downloadImage(url: string, name: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    a.remove();
}
