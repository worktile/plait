export interface SVGArcCommand {
    rx: number;
    ry: number;
    xAxisRotation: number;
    largeArcFlag: 0 | 1;
    sweepFlag: 0 | 1;
    endX: number;
    endY: number;
}
