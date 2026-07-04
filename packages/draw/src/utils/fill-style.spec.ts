import { BOARD_TO_ROUGH_SVG, createTestingBoard, PlaitBoard, RectangleClient } from '@plait/core';
import { withDraw } from '../plugins/with-draw';
import { Options } from 'roughjs/bin/core';
import { GeometryShapeGenerator } from '../generators/geometry-shape.generator';
import { drawShape } from './common';
import { TableSymbols, PlaitTable } from '../interfaces/table';
import { PlaitGeometry, BasicShapes, FlowchartSymbols, FILL_STYLES, UMLSymbols } from '../interfaces/geometry';
import { drawGeometry } from './geometry';

describe('fillStyle', () => {
    let board: PlaitBoard;

    beforeEach(() => {
        board = createTestingBoard([withDraw], []);
        BOARD_TO_ROUGH_SVG.set(board, createTestingRoughSVG());
    });

    const createTestingRoughSVG = () => {
        const createG = () => document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
        return {
            rectangle: () => createG(),
            path: () => createG(),
            linearPath: () => createG()
        } as any;
    };

    describe('GeometryShapeGenerator', () => {
        it('should use solid fillStyle by default', () => {
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const rectangleSpy = spyOn(roughSVG, 'rectangle').and.callThrough();
            const element: PlaitGeometry = {
                id: 'test-default-fill-style',
                type: 'geometry',
                shape: BasicShapes.rectangle,
                points: [
                    [0, 0],
                    [100, 100]
                ],
                fill: '#FF5733'
            };

            new GeometryShapeGenerator(board).draw(element, {});

            const options = rectangleSpy.calls.mostRecent().args[4] as Options;
            expect(options.fillStyle).toBe('solid');
        });

        it('should pass element fillStyle to shape engine', () => {
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const rectangleSpy = spyOn(roughSVG, 'rectangle').and.callThrough();
            const element: PlaitGeometry = {
                id: 'test-custom-fill-style',
                type: 'geometry',
                shape: BasicShapes.rectangle,
                points: [
                    [0, 0],
                    [100, 100]
                ],
                fill: '#FF5733',
                fillStyle: 'hachure'
            };

            new GeometryShapeGenerator(board).draw(element, {});

            const options = rectangleSpy.calls.mostRecent().args[4] as Options;
            expect(options.fillStyle).toBe('hachure');
        });
    });

    describe('drawGeometry', () => {
        it('should use solid fillStyle by default when called directly', () => {
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const rectangleSpy = spyOn(roughSVG, 'rectangle').and.callThrough();
            const rectangle: RectangleClient = {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            };

            drawGeometry(board, rectangle, BasicShapes.rectangle, {
                stroke: '#000000',
                strokeWidth: 2,
                fill: '#FF5733'
            });

            const options = rectangleSpy.calls.mostRecent().args[4] as Options;
            expect(options.fillStyle).toBe('solid');
        });

        it('should support all fill styles when called directly', () => {
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const rectangleSpy = spyOn(roughSVG, 'rectangle').and.callThrough();
            const rectangle: RectangleClient = {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            };

            FILL_STYLES.forEach((fillStyle) => {
                drawGeometry(board, rectangle, BasicShapes.rectangle, {
                    stroke: '#000000',
                    strokeWidth: 2,
                    fill: '#FF5733',
                    fillStyle
                });

                const options = rectangleSpy.calls.mostRecent().args[4] as Options;
                expect(options.fillStyle).toBe(fillStyle);
            });
        });

        it('should preserve fillStyle for path based geometry engines', () => {
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const pathSpy = spyOn(roughSVG, 'path').and.callThrough();
            const rectangle: RectangleClient = {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            };

            const roughOptions: Options = {
                stroke: '#000000',
                strokeWidth: 2,
                fill: '#FF5733',
                fillStyle: 'hachure'
            };
            const shapes = [
                FlowchartSymbols.delay,
                FlowchartSymbols.predefinedProcess,
                UMLSymbols.activityClass,
                UMLSymbols.container,
                UMLSymbols.deletion
            ];

            shapes.forEach((shape) => {
                drawGeometry(board, rectangle, shape, roughOptions);
                const options = pathSpy.calls.mostRecent().args[1] as Options;
                expect(options.fillStyle).toBe('hachure');
            });
        });
    });

    describe('drawShape', () => {
        it('should use solid fillStyle by default for table cell fills', () => {
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const rectangleSpy = spyOn(roughSVG, 'rectangle').and.callThrough();
            const rectangle: RectangleClient = {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            };
            const table: PlaitTable = {
                id: 'test-table',
                type: 'table',
                points: [
                    [0, 0],
                    [100, 100]
                ],
                rows: [{ id: 'row-1' }],
                columns: [{ id: 'column-1' }],
                cells: [{ id: 'cell-1', rowId: 'row-1', columnId: 'column-1', fill: '#FF5733' }]
            };
            (board as any).buildTable = (element: PlaitTable) => element;

            drawShape(
                board,
                rectangle,
                TableSymbols.table,
                {
                    stroke: '#000000',
                    strokeWidth: 2
                },
                { element: table }
            );

            const options = rectangleSpy.calls.mostRecent().args[4] as Options;
            expect(options.fillStyle).toBe('solid');
        });

    });
});
