import { animate, linear } from '../../utils/animate';

export function edgePointAnimate(path: SVGPathElement, pointG: SVGGElement) {
    const pathLength = path.getTotalLength();
    animate(
        (t: number) => {
            const point = path.getPointAtLength(t * pathLength);
            pointG.setAttribute('transform', `translate(${point.x}, ${point.y})`);
        },
        1000,
        linear,
        () => {
            edgePointAnimate(path, pointG);
        }
    );
}
