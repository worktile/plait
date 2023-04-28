import { drawAbstractRoundRectangle, createG } from '@plait/core';
import { ABSTRACT_HANDLE, PRIMARY_COLOR } from '../constants';
import { RoughSVG } from 'roughjs/bin/svg';

export function drawAbstractActive(roughSVG: RoughSVG, x: number, y: number, width: number, height: number, isHorizontalRec: boolean) {
    const abstractIncludeG = createG();
    let startHandle: SVGGElement;
    let rectangle: SVGGElement;
    let startHandleMask: SVGElement;
    let endHandle: SVGElement;
    let endHandleMask: SVGElement;
    rectangle = drawAbstractRoundRectangle(roughSVG, x, y, x + width, y + height, isHorizontalRec, {
        stroke: PRIMARY_COLOR,
        strokeWidth: 1,
        fillStyle: 'solid'
    });
    if (isHorizontalRec) {
        startHandle = roughSVG.line(x, y + height / 2 - 4, x, y + height / 2 + 4, {
            stroke: ABSTRACT_HANDLE,
            strokeWidth: 3,
            fillStyle: 'solid'
        });

        startHandleMask = roughSVG.line(x, y, x, y + height, {
            stroke: 'rgba(255,255,255,0)',
            strokeWidth: 8,
            fill: 'none',
            fillStyle: 'solid'
        });

        endHandle = roughSVG.line(x + width, y + height / 2 - 4, x + width, y + height / 2 + 4, {
            stroke: ABSTRACT_HANDLE,
            strokeWidth: 3,
            fillStyle: 'solid'
        });

        endHandleMask = roughSVG.line(x + width, y, x + width, y + height, {
            stroke: 'rgba(255,255,255,0)',
            strokeWidth: 8,
            fill: 'none',
            fillStyle: 'solid'
        });
    } else {
        startHandle = roughSVG.line(x + width / 2 - 4, y, x + width / 2 + 4, y, {
            stroke: ABSTRACT_HANDLE,
            strokeWidth: 3,
            fillStyle: 'solid'
        });

        startHandleMask = roughSVG.line(x, y, x + width, y, {
            stroke: 'rgba(255,255,255,0)',
            strokeWidth: 8,
            fill: 'none',
            fillStyle: 'solid'
        });

        endHandle = roughSVG.line(x + width / 2 - 4, y + height, x + width / 2 + 4, y + height, {
            stroke: ABSTRACT_HANDLE,
            strokeWidth: 3,
            fillStyle: 'solid'
        });

        endHandleMask = roughSVG.line(x, y + height, x + width, y + height, {
            stroke: 'rgba(255,255,255,0)',
            strokeWidth: 8,
            fill: 'none',
            fillStyle: 'solid'
        });
    }

    abstractIncludeG.classList.add('abstract-includeG');
    if (isHorizontalRec) {
        abstractIncludeG.classList.add('abstract-horizontal');
    }
    startHandle!.querySelector('path')?.setAttribute('stroke-linecap', 'round');
    endHandle.querySelector('path')?.setAttribute('stroke-linecap', 'round');
    startHandleMask.classList.add('abstract-start-handle-mask');
    endHandleMask.classList.add('abstract-end-handle-mask');

    abstractIncludeG.append(startHandle!);
    abstractIncludeG.append(endHandle);
    abstractIncludeG.append(startHandleMask);
    abstractIncludeG.append(endHandleMask);
    abstractIncludeG.append(rectangle);
    return abstractIncludeG;
}
