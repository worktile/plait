import { PlaitBoard, PlaitElement } from '../interfaces';
import { BOARD_TO_ELEMENT_HOST, BOARD_TO_HOST, NODE_TO_G } from './weak-maps';
import { toSvgData } from './to-image';

describe('toSvgData', () => {
    const svgNamespace = 'http://www.w3.org/2000/svg';

    afterEach(() => {
        document.querySelectorAll('[data-to-image-spec]').forEach((node) => node.remove());
    });

    it('preserves Slate text color styles when cloning export nodes', async () => {
        const element = { id: 'text-color' } as PlaitElement;
        const board = {
            children: [element],
            getRectangle: () => ({ x: 0, y: 0, width: 120, height: 40 })
        } as unknown as PlaitBoard;
        const svg = document.createElementNS(svgNamespace, 'svg');
        const elementHost = document.createElementNS(svgNamespace, 'g');
        const elementG = document.createElementNS(svgNamespace, 'g');
        const foreignObject = document.createElementNS(svgNamespace, 'foreignObject');
        const textNode = document.createElement('span');

        textNode.setAttribute('data-slate-node', 'text');
        textNode.style.fontSize = '16px';
        textNode.style.color = 'rgb(255, 0, 0)';
        textNode.textContent = 'colored text';
        foreignObject.append(textNode);
        elementG.append(foreignObject);
        elementHost.append(elementG);
        svg.setAttribute('data-to-image-spec', '');
        svg.append(elementHost);
        document.body.append(svg);

        BOARD_TO_HOST.set(board, svg);
        BOARD_TO_ELEMENT_HOST.set(board, {
            lowerHost: document.createElementNS(svgNamespace, 'g'),
            host: elementHost,
            upperHost: document.createElementNS(svgNamespace, 'g'),
            topHost: document.createElementNS(svgNamespace, 'g'),
            activeHost: document.createElementNS(svgNamespace, 'g'),
            container: document.createElement('div'),
            viewportContainer: document.createElement('div')
        });
        NODE_TO_G.set(element, elementG);

        const svgData = await toSvgData(board, { elements: [element] });
        const exportedSvg = new DOMParser().parseFromString(svgData, 'image/svg+xml');
        const exportedTextNode = exportedSvg.querySelector('[data-slate-node="text"]') as HTMLElement;

        expect(exportedTextNode.style.color).toBe('rgb(255, 0, 0)');
    });
});
