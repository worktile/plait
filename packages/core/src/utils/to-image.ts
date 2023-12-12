import { PlaitBoard, PlaitElement } from '../interfaces';
import { getRectangleByElements } from './element';

const IMAGE_CONTAINER = 'plait-image-container';

export interface ToImageOptions {
    elements?: PlaitElement[];
    name?: string;
    ratio?: number;
    padding?: number;
    fillStyle?: string;
    // 逗号类名列表。 该列表必须采用 class1,class2,... 的形式。
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
        img.crossOrigin = 'anonymous';
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

/**
 * clone svg element
 * @param board board
 * @param options parameter configuration
 * @returns clone svg element
 */
async function cloneSvg(board: PlaitBoard, elements: PlaitElement[], options: ToImageOptions) {
    const elementHostBox = getRectangleByElements(board, elements, true);
    const { width, height, x, y } = elementHostBox;
    const { padding = 4, inlineStyleClassNames } = options;
    const sourceSvg = PlaitBoard.getHost(board);
    const cloneSvgElement = sourceSvg.cloneNode(true) as SVGElement;
    console.log(cloneSvgElement);
    Array.from(cloneSvgElement.children).forEach(child => {
        if (child.tagName === 'g' && !child.classList.contains('element-host')) {
            cloneSvgElement.removeChild(child);
        }
    });
    console.log(cloneSvgElement);

    cloneSvgElement.style.width = `${width}px`;
    cloneSvgElement.style.height = `${height}px`;
    cloneSvgElement.style.backgroundColor = '';
    cloneSvgElement.setAttribute('width', `${width}`);
    cloneSvgElement.setAttribute('height', `${height}`);
    cloneSvgElement.setAttribute('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(','));

    if (inlineStyleClassNames) {
        const classNames = inlineStyleClassNames + `,.${IMAGE_CONTAINER}`;
        const sourceNodes = Array.from(sourceSvg.querySelectorAll(classNames));
        const cloneNodes = Array.from(cloneSvgElement.querySelectorAll(classNames));

        sourceNodes.forEach((node, index) => {
            const cloneNode = cloneNodes[index];
            const childElements = Array.from(node.querySelectorAll('*')).filter(isElementNode) as HTMLElement[];
            const cloneChildElements = Array.from(cloneNode.querySelectorAll('*')).filter(isElementNode) as HTMLElement[];
            sourceNodes.push(...childElements);
            cloneNodes.push(...cloneChildElements);
        });

        // processing styles
        sourceNodes.map((node, index) => {
            const cloneNode = cloneNodes[index];
            cloneCSSStyle(node as HTMLElement, cloneNode as HTMLElement);
        });
    }

    // 使用 Promise.all 等待所有异步操作完成
    const sourceImageNodes = Array.from(sourceSvg.querySelectorAll(`.${IMAGE_CONTAINER}`));
    const cloneImageNodes = Array.from(cloneSvgElement.querySelectorAll(`.${IMAGE_CONTAINER}`));
    await Promise.all(
        sourceImageNodes.map((_, index) => {
            return new Promise(resolve => {
                const cloneNode = cloneImageNodes[index];
                // processing image
                const image = (cloneNode as HTMLElement).querySelector('img');
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

    const elements = options?.elements || board.children;
    console.log(elements);
    const elementHostBox = getRectangleByElements(board, elements, true);
    const { ratio = 2, fillStyle = 'transparent' } = options;
    const { width, height } = elementHostBox;
    const ratioWidth = width * ratio;
    const ratioHeight = height * ratio;

    const cloneSvgElement = await cloneSvg(board, elements, options);
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
