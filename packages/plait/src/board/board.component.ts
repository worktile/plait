import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    ViewChild
} from '@angular/core';
import { BOARD_TO_ON_CHANGE, HOST_TO_ROUGH_SVG, IS_TEXT_EDITABLE } from '../utils/weak-maps';
import { PlaitBoardChangeEvent, PlaitBoard } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { createBoard } from '../plugins/create-board';
import { withBoard } from '../plugins/with-board';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PlaitPlugin } from '../interfaces/plugin';
import { RoughSVG } from 'roughjs/bin/svg';
import rough from 'roughjs/bin/rough';
import { Transforms } from '../transfroms';
import { withSelection } from '../plugins/with-selection';
import { Viewport } from '../interfaces';

@Component({
    selector: 'plait-board',
    template: `
        <svg #svg width="100%" height="100%"></svg>
        <plait-element
            *ngFor="let item of board.children; let index = index; trackBy: trackBy"
            [index]="index"
            [element]="item"
            [board]="board"
            [selection]="board.selection"
            [host]="svgHost"
        ></plait-element>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitBoardComponent implements OnInit, OnDestroy {
    @HostBinding('class') hostClass = `plait-board-container`;

    board!: PlaitBoard;

    roughSVG!: RoughSVG;

    destroy$: Subject<any> = new Subject();

    @ViewChild('svg', { static: true })
    svg!: ElementRef;

    get svgHost(): SVGElement {
        return this.svg.nativeElement;
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Output() plaitChange: EventEmitter<PlaitBoardChangeEvent> = new EventEmitter();

    constructor(private cdr: ChangeDetectorRef, private elementRef: ElementRef<HTMLElement>, private renderer2: Renderer2) {}

    ngOnInit(): void {
        const roughSVG = rough.svg(this.svgHost as SVGSVGElement, { options: { roughness: 0, strokeWidth: 1 } });
        HOST_TO_ROUGH_SVG.set(this.svgHost, roughSVG);
        this.initializePlugins();
        this.initializeEvents();
        BOARD_TO_ON_CHANGE.set(this.board, () => {
            this.cdr.detectChanges();
            const changeEvent: PlaitBoardChangeEvent = {
                children: this.board.children,
                operations: this.board.operations,
                viewport: this.board.viewport,
                selection: this.board.selection
            };
            if (this.plaitViewport !== this.board.viewport) {
                this.plaitViewport = this.board.viewport;
                this.transform(this.board.viewport)
            }
            this.plaitChange.emit(changeEvent);
        });
        if (this.plaitViewport) {
            this.transform(this.plaitViewport);
        }
    }

    initializePlugins() {
        let board = withSelection(withBoard(createBoard(this.svgHost, this.plaitValue)));
        this.plaitPlugins.forEach(plugin => {
            board = plugin(board);
        });
        this.board = board;
        if (this.plaitViewport) {
            this.transform(this.plaitViewport);
        }
    }

    initializeEvents() {
        fromEvent<MouseEvent>(this.nativeElement, 'mousedown')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mousedown(event);
            });
        fromEvent<MouseEvent>(this.nativeElement, 'mousemove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mousemove(event);
            });
        fromEvent<MouseEvent>(document, 'mouseup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mouseup(event);
            });
        fromEvent<MouseEvent>(this.nativeElement, 'dblclick')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.dblclick(event);
            });
        fromEvent<WheelEvent>(this.nativeElement, 'wheel')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: WheelEvent) => {
                event.preventDefault();
                const viewport = this.board.viewport;
                Transforms.setViewport(this.board, {
                    ...viewport,
                    offsetX: viewport?.offsetX - event.deltaX,
                    offsetY: viewport?.offsetY - event.deltaY
                });
            });
        fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => {
                    return !IS_TEXT_EDITABLE.get(this.board as PlaitBoard);
                })
            )
            .subscribe((event: KeyboardEvent) => {
                this.board?.keydown(event);
            });
        fromEvent<KeyboardEvent>(document, 'keyup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: KeyboardEvent) => {
                this.board?.keyup(event);
            });
    }

    transform(viewport: Viewport) {
        this.renderer2.setAttribute(this.svgHost, 'style', `transform: translate(${viewport.offsetX}px, ${viewport.offsetY}px)`);
    }

    trackBy = (index: number, element: PlaitElement) => {
        return index;
    };

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        HOST_TO_ROUGH_SVG.delete(this.svgHost);
    }
}
