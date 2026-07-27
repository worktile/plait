import { PlaitBoard, RectangleClient, TestingBoardFixture } from '@plait/core';
import { setupTestingBoard } from '@plait/core';
import { withDraw } from '../plugins/with-draw';
import { Options } from 'roughjs/bin/core';
import { GeometryShapeGenerator } from '../generators/geometry-shape.generator';
import { drawShape } from './common';
import { TableSymbols, PlaitTable } from '../interfaces/table';
import { PlaitGeometry, BasicShapes, FlowchartSymbols, FILL_STYLES, UMLSymbols } from '../interfaces/geometry';
import { drawGeometry } from './geometry';

describe('fillStyle', () => {
    let fixture: TestingBoardFixture;

    beforeEach(() => {
        fixture = setupTestingBoard([withDraw], [], {
            withNodeWeakMap: false,
            withElementHost: false,
            withHost: false,
            withRoughSVG: true
        });
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('GeometryShapeGenerator', () => {
        it('should use solid fillStyle by default', () => {
            const roughSVG = PlaitBoard.getRoughSVG(fixture.board);
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
            new GeometryShapeGenerator(fixture.board).draw(element, {});
            const options = rectangleSpy.calls.mostRecent().args[4] as Options;
            expect(options.fillStyle).toBe('solid');
        });

        it('should pass element fillStyle to shape engine', () => {
            const roughSVG = PlaitBoard.getRoughSVG(fixture.board);
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

            new GeometryShapeGenerator(fixture.board).draw(element, {});
            const options = rectangleSpy.calls.mostRecent().args[4] as Options;
            expect(options.fillStyle).toBe('hachure');
        });
    });

    describe('drawGeometry', () => {
        it('should use solid fillStyle by default when called directly', () => {
            const roughSVG = PlaitBoard.getRoughSVG(fixture.board);
            const rectangleSpy = spyOn(roughSVG, 'rectangle').and.callThrough();
            const rectangle: RectangleClient = {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            };

            drawGeometry(fixture.board, rectangle, BasicShapes.rectangle, {
                stroke: '#000000',
                strokeWidth: 2,
                fill: '#FF5733'
            });

            const options = rectangleSpy.calls.mostRecent().args[4] as Options;
            expect(options.fillStyle).toBe('solid');
        });

        it('should support all fill styles when called directly', () => {
            const roughSVG = PlaitBoard.getRoughSVG(fixture.board);
            const rectangleSpy = spyOn(roughSVG, 'rectangle').and.callThrough();
            const rectangle: RectangleClient = {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            };

            FILL_STYLES.forEach((fillStyle) => {
                drawGeometry(fixture.board, rectangle, BasicShapes.rectangle, {
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
            const roughSVG = PlaitBoard.getRoughSVG(fixture.board);
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
                drawGeometry(fixture.board, rectangle, shape, roughOptions);
                const options = pathSpy.calls.mostRecent().args[1] as Options;
                expect(options.fillStyle).toBe('hachure');
            });
        });
    });

    describe('drawShape', () => {
        it('should use solid fillStyle by default for table cell fills', () => {
            const roughSVG = PlaitBoard.getRoughSVG(fixture.board);
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
            (fixture.board as any).buildTable = (element: PlaitTable) => element;

            drawShape(
                fixture.board,
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
