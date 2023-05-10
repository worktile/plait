import { Options } from 'roughjs/bin/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { MAX_RADIUS } from '../../constants';

/**
 * drawRoundRectangle
 */
export function drawRoundRectangle(
    rs: RoughSVG,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: Options,
    outline = false,
    borderRadius?: number
) {
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    const defaultRadius = Math.min(width, height) / 8;
    let radius = borderRadius || defaultRadius;
    if (defaultRadius > MAX_RADIUS) {
        radius = outline ? MAX_RADIUS + 2 : MAX_RADIUS;
    }

    const point1 = [x1 + radius, y1];
    const point2 = [x2 - radius, y1];
    const point3 = [x2, y1 + radius];
    const point4 = [x2, y2 - radius];
    const point5 = [x2 - radius, y2];
    const point6 = [x1 + radius, y2];
    const point7 = [x1, y2 - radius];
    const point8 = [x1, y1 + radius];

    return rs.path(
        `M${point2[0]} ${point2[1]} A ${radius} ${radius}, 0, 0, 1, ${point3[0]} ${point3[1]} L ${point4[0]} ${point4[1]} A ${radius} ${radius}, 0, 0, 1, ${point5[0]} ${point5[1]} L ${point6[0]} ${point6[1]} A ${radius} ${radius}, 0, 0, 1, ${point7[0]} ${point7[1]} L ${point8[0]} ${point8[1]} A ${radius} ${radius}, 0, 0, 1, ${point1[0]} ${point1[1]} Z`,
        options
    );
}

export function drawAbstractRoundRectangle(
    rs: RoughSVG,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    isHorizontal: boolean,
    options: Options
) {
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    const radius = 5;
    const handleGap = 4;
    const handleLength = 10;

    const handleSpace = handleLength + handleGap * 2;

    if (isHorizontal) {
        const handleSideLine = (width - handleSpace - radius * 2) / 2;
        const sideLine = height - radius * 2;
        return rs.path(
            `M${x1 + radius},${y1}
            l${handleSideLine},0
            m${handleSpace},0
            l${handleSideLine},0
            a${radius},${radius},0,0,1,${radius},${radius}
            l0,${sideLine}
            a${radius},${radius},0,0,1,-${radius},${radius}
            l-${handleSideLine},0
            m-${handleSpace},0
            l-${handleSideLine},0
            a${radius},${radius},0,0,1,-${radius},-${radius}
            l0,-${sideLine}
            a${radius},${radius},0,0,1,${radius},-${radius}`,
            options
        );
    } else {
        const handleSideLine = (height - handleSpace - radius * 2) / 2;
        const sideLine = width - radius * 2;
        return rs.path(
            `M${x1 + radius},${y1}
            l${sideLine},0
            a${radius},${radius},0,0,1,${radius},${radius}
            l0,${handleSideLine}
            m0,${handleSpace}
            l0,${handleSideLine}
            a${radius},${radius},0,0,1,-${radius},${radius}
            l-${sideLine},0
            a${radius},${radius},0,0,1,-${radius},-${radius}
            l0,-${handleSideLine}
            m0,-${handleSpace}
            l0,-${handleSideLine}
            a${radius},${radius},0,0,1,${radius},-${radius}`,
            options
        );
    }
}
