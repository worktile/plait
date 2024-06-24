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
function convertImageToBase64(url: string) {
    return loadImage(url).then(img => {
        const { canvas, ctx } = createCanvas(img.width, img.height);
        ctx?.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    });
}

/**
 * clone node style
 * @param nativeNode source node
 * @param clonedNode clone node
 */
function cloneCSSStyle<T extends HTMLElement>(nativeNode: T, clonedNode: T) {
    const targetStyle = clonedNode?.style;
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

/**
 * batch clone target styles
 * @param sourceNode
 * @param cloneNode
 * @param inlineStyleClassNames
 */
function batchCloneCSSStyle(sourceNode: SVGGElement, cloneNode: SVGGElement, inlineStyleClassNames: string) {
    if (inlineStyleClassNames) {
        const classNames = inlineStyleClassNames + `, ${FOREIGN_OBJECT_EXPRESSION}`;
        const sourceNodes = Array.from(sourceNode.querySelectorAll(classNames));
        const cloneNodes = Array.from(cloneNode.querySelectorAll(classNames));

        sourceNodes.forEach((node, index) => {
            const childElements = Array.from(node.querySelectorAll('*')).filter(isElementNode) as HTMLElement[];
            const cloneChildElements = Array.from(cloneNodes[index].querySelectorAll('*')).filter(isElementNode) as HTMLElement[];
            sourceNodes.push(...childElements);
            cloneNodes.push(...cloneChildElements);
        });

        // processing styles
        sourceNodes.map((node, index) => {
            cloneCSSStyle(node as HTMLElement, cloneNodes[index] as HTMLElement);
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
            return new Promise(resolve => {
                const cloneImageNode = cloneImageNodes[index];
                // processing image
                const image = (cloneImageNode as HTMLElement).querySelector('img');
                const url = image?.getAttribute('src');
                if (!url) {
                    return resolve(true);
                }
                convertImageToBase64(url).then(base64Image => {
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
    const { padding = 4, inlineStyleClassNames } = options;
    const sourceSvg = PlaitBoard.getHost(board);
    const selectedGElements = elements.map(value => PlaitElement.getElementG(value));
    const cloneSvgElement = sourceSvg.cloneNode() as SVGElement;
    const newHostElement = PlaitBoard.getElementHost(board).cloneNode() as SVGGElement;

    cloneSvgElement.style.width = `${width}px`;
    cloneSvgElement.style.height = `${height}px`;
    cloneSvgElement.style.backgroundColor = '';
    cloneSvgElement.setAttribute('width', `${width}`);
    cloneSvgElement.setAttribute('height', `${height}`);
    cloneSvgElement.setAttribute('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(','));

    await Promise.all(
        selectedGElements.map(async (child, i) => {
            const cloneChild = child.cloneNode(true) as SVGGElement;
            batchCloneCSSStyle(child, cloneChild, inlineStyleClassNames as string);

            await batchConvertImage(child, cloneChild);
            newHostElement.appendChild(cloneChild);
        })
    );
    cloneSvgElement.appendChild(newHostElement);
    return cloneSvgElement;
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

    const cloneSvgElement = await cloneSvg(board, elements, targetRectangle, options);
    const { canvas, ctx } = createCanvas(ratioWidth, ratioHeight, fillStyle);

    const svgStr = new XMLSerializer().serializeToString(cloneSvgElement);
    const imgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;

    try {
        const img = await loadImage(imgSrc);
        ctx.drawImage(img, 0, 0, ratioWidth, ratioHeight);
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error converting SVG to image:', error);
        return undefined;
    }
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
