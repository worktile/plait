import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    SimpleChanges,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import rough from 'roughjs/bin/rough';
import { RoughSVG } from 'roughjs/bin/svg';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitBoardOptions } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { PlaitPlugin } from '../interfaces/plugin';
import { Viewport } from '../interfaces/viewport';
import { createBoard } from '../plugins/create-board';
import { withBoard } from '../plugins/with-board';
import { withHistory } from '../plugins/with-history';
import { withHandPointer } from '../plugins/with-hand';
import { withSelection } from '../plugins/with-selection';
import { IS_CHROME, IS_FIREFOX, IS_SAFARI, getRectangleByElements, getSelectedElements, hotkeys, toPoint, transformPoint } from '../utils';
import {
    BOARD_TO_ON_CHANGE,
    BOARD_TO_COMPONENT,
    BOARD_TO_ELEMENT_HOST,
    BOARD_TO_HOST,
    BOARD_TO_ROUGH_SVG,
    BOARD_TO_MOVING_POINT_IN_BOARD,
    BOARD_TO_MOVING_POINT
} from '../utils/weak-maps';
import { BoardComponentInterface } from './board.component.interface';
import {
    getViewBox,
    initializeViewportOffset,
    initializeViewBox,
    isFromViewportChange,
    setIsFromViewportChange,
    initializeViewportContainer,
    updateViewportOffset,
    setIsFromScrolling
} from '../utils/viewport';
import { withViewport } from '../plugins/with-viewport';
import { Point } from '../interfaces/point';
import { withMoving } from '../plugins/with-moving';
import { hasInputOrTextareaTarget } from '../utils/dom/common';
import { withOptions } from '../plugins/with-options';
import { PlaitIslandBaseComponent, hasOnBoardChange } from '../core/island/island-base.component';
import { BoardTransforms } from '../transforms/board';
import { PlaitTheme } from '../interfaces/theme';
import { withHotkey } from '../plugins/with-hotkey';
import { HOST_CLASS_NAME } from '../constants';
import { PlaitContextService } from '../services/image-context.service';

const ElementHostClass = 'element-host';
const ElementHostUpClass = 'element-host-up';
const ElementHostActiveClass = 'element-host-active';

@Component({
    selector: 'plait-board',
    template: `
        <div class="viewport-container" #viewportContainer>
            <svg #svg width="100%" height="100%" style="position: relative;" class="board-host-svg">
                <g class="element-host"></g>
                <g class="element-host-up"></g>
                <g class="element-host-active"></g>
            </svg>
            <plait-children [board]="board" [effect]="effect"></plait-children>
        </div>
        <ng-content></ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PlaitContextService]
})
export class PlaitBoardComponent implements BoardComponentInterface, OnInit, OnChanges, AfterViewInit, AfterContentInit, OnDestroy {
    hasInitialized = false;

    effect = {};

    board!: PlaitBoard;

    roughSVG!: RoughSVG;

    destroy$ = new Subject<void>();

    private resizeObserver!: ResizeObserver;

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Input() plaitOptions?: PlaitBoardOptions;

    @Input() plaitTheme?: PlaitTheme;

    @Output() plaitChange: EventEmitter<PlaitBoardChangeEvent> = new EventEmitter();

    @Output() plaitBoardInitialized: EventEmitter<PlaitBoard> = new EventEmitter();

    get host(): SVGSVGElement {
        return this.svg.nativeElement;
    }

    @HostBinding('class')
    get hostClass() {
        return `${HOST_CLASS_NAME} pointer-${this.board.pointer} theme-${this.board.theme.themeColorMode} ${this.getBrowserClassName()}`;
    }

    getBrowserClassName() {
        if (IS_SAFARI) {
            return 'safari';
        }
        if (IS_CHROME) {
            return 'chrome';
        }
        if (IS_FIREFOX) {
            return 'firefox';
        }
        return '';
    }

    @HostBinding('class.readonly')
    get readonly() {
        return this.board.options.readonly;
    }

    @HostBinding('class.focused')
    get isFocused() {
        return PlaitBoard.isFocus(this.board);
    }

    @HostBinding('class.disabled-scroll')
    get disabledScrollOnNonFocus() {
        return this.board.options.disabledScrollOnNonFocus && !PlaitBoard.isFocus(this.board);
    }

    get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    @ViewChild('svg', { static: true })
    svg!: ElementRef;

    @ViewChild('viewportContainer', { read: ElementRef, static: true })
    viewportContainer!: ElementRef;

    @ContentChildren(PlaitIslandBaseComponent, { descendants: true }) islands?: QueryList<PlaitIslandBaseComponent>;

    constructor(
        public cdr: ChangeDetectorRef,
        public viewContainerRef: ViewContainerRef,
        private elementRef: ElementRef<HTMLElement>,
        private ngZone: NgZone
    ) {}

    ngOnInit(): void {
        const elementHost = this.host.querySelector(`.${ElementHostClass}`) as SVGGElement;
        const elementHostUp = this.host.querySelector(`.${ElementHostUpClass}`) as SVGGElement;
        const elementHostActive = this.host.querySelector(`.${ElementHostActiveClass}`) as SVGGElement;
        const roughSVG = rough.svg(this.host as SVGSVGElement, {
            options: { roughness: 0, strokeWidth: 1 }
        });
        this.roughSVG = roughSVG;
        this.initializePlugins();
        this.ngZone.runOutsideAngular(() => {
            this.initializeHookListener();
            this.viewportScrollListener();
            this.elementResizeListener();
            fromEvent<MouseEvent>(document, 'mouseleave')
                .pipe(takeUntil(this.destroy$))
                .subscribe((event: MouseEvent) => {
                    BOARD_TO_MOVING_POINT.delete(this.board);
                });
        });
        BOARD_TO_COMPONENT.set(this.board, this);
        BOARD_TO_ROUGH_SVG.set(this.board, roughSVG);
        BOARD_TO_HOST.set(this.board, this.host);
        BOARD_TO_ELEMENT_HOST.set(this.board, {
            host: elementHost,
            hostUp: elementHostUp,
            hostActive: elementHostActive
        });
        BOARD_TO_ON_CHANGE.set(this.board, () => {
            this.ngZone.run(() => {
                this.detect();
                const changeEvent: PlaitBoardChangeEvent = {
                    children: this.board.children,
                    operations: this.board.operations,
                    viewport: this.board.viewport,
                    selection: this.board.selection,
                    theme: this.board.theme
                };
                this.updateIslands();
                this.plaitChange.emit(changeEvent);
            });
        });
        this.hasInitialized = true;
    }

    ngAfterContentInit(): void {
        this.initializeIslands();
    }

    detect() {
        this.effect = {};
        this.cdr.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.hasInitialized) {
            const valueChange = changes['plaitValue'];
            const options = changes['plaitOptions'];

            if (valueChange) this.board.children = valueChange.currentValue;
            if (options) this.board.options = options.currentValue;
            this.cdr.markForCheck();
        }
    }

    ngAfterViewInit(): void {
        this.plaitBoardInitialized.emit(this.board);
        initializeViewportContainer(this.board);
        initializeViewBox(this.board);
        initializeViewportOffset(this.board);
    }

    private initializePlugins() {
        let board = withHotkey(
            withHandPointer(
                withHistory(
                    withSelection(withMoving(withBoard(withViewport(withOptions(createBoard(this.plaitValue, this.plaitOptions))))))
                )
            )
        );
        this.plaitPlugins.forEach(plugin => {
            board = plugin(board);
        });
        this.board = board;

        if (this.plaitViewport) {
            this.board.viewport = this.plaitViewport;
        }

        if (this.plaitTheme) {
            this.board.theme = this.plaitTheme;
        }
    }

    private initializeHookListener() {
        fromEvent<MouseEvent>(this.host, 'mousedown')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mousedown(event);
            });

        fromEvent<PointerEvent>(this.host, 'pointerdown')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: PointerEvent) => {
                this.board.pointerDown(event);
            });

        fromEvent<MouseEvent>(this.host, 'mousemove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                BOARD_TO_MOVING_POINT_IN_BOARD.set(this.board, [event.x, event.y]);
                this.board.mousemove(event);
            });

        fromEvent<PointerEvent>(this.host, 'pointermove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: PointerEvent) => {
                BOARD_TO_MOVING_POINT_IN_BOARD.set(this.board, [event.x, event.y]);
                this.board.pointerMove(event);
            });

        fromEvent<MouseEvent>(this.host, 'mouseleave')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                BOARD_TO_MOVING_POINT_IN_BOARD.delete(this.board);
                this.board.mouseleave(event);
            });

        fromEvent<PointerEvent>(this.host, 'pointerleave')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: PointerEvent) => {
                BOARD_TO_MOVING_POINT_IN_BOARD.delete(this.board);
                this.board.pointerLeave(event);
            });

        fromEvent<MouseEvent>(document, 'mousemove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                BOARD_TO_MOVING_POINT.set(this.board, [event.x, event.y]);
                this.board.globalMousemove(event);
            });

        fromEvent<PointerEvent>(document, 'pointermove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: PointerEvent) => {
                BOARD_TO_MOVING_POINT.set(this.board, [event.x, event.y]);
                this.board.globalPointerMove(event);
            });

        fromEvent<MouseEvent>(this.host, 'mouseup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.mouseup(event);
            });

        fromEvent<PointerEvent>(this.host, 'pointerup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: PointerEvent) => {
                this.board.pointerUp(event);
            });

        fromEvent<MouseEvent>(document, 'mouseup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: MouseEvent) => {
                this.board.globalMouseup(event);
            });

        fromEvent<PointerEvent>(document, 'pointerup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: PointerEvent) => {
                this.board.globalPointerUp(event);
            });

        fromEvent<MouseEvent>(this.host, 'dblclick')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: MouseEvent) => {
                this.board.dblclick(event);
            });

        fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                takeUntil(this.destroy$),
                tap(event => {
                    this.board.globalKeydown(event);
                }),
                filter(event => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board) && !hasInputOrTextareaTarget(event.target))
            )
            .subscribe((event: KeyboardEvent) => {
                const selectedElements = getSelectedElements(this.board);
                if (selectedElements.length > 0 && (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event))) {
                    this.board.deleteFragment(null);
                }
                this.board.keydown(event);
            });

        fromEvent<KeyboardEvent>(document, 'keyup')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: KeyboardEvent) => {
                this.board?.keyup(event);
            });

        fromEvent<ClipboardEvent>(document, 'copy')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: ClipboardEvent) => {
                const selectedElements = getSelectedElements(this.board);
                if (selectedElements.length > 0) {
                    event.preventDefault();
                    const rectangle = getRectangleByElements(this.board, selectedElements, false);
                    this.board.setFragment(event.clipboardData, rectangle);
                }
            });

        fromEvent<ClipboardEvent>(document, 'paste')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.isReadonly(this.board) && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((clipboardEvent: ClipboardEvent) => {
                const mousePoint = PlaitBoard.getMovingPointInBoard(this.board);
                if (mousePoint) {
                    const targetPoint = transformPoint(this.board, toPoint(mousePoint[0], mousePoint[1], this.host));
                    this.board.insertFragment(clipboardEvent.clipboardData, targetPoint);
                }
            });

        fromEvent<ClipboardEvent>(document, 'cut')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.isReadonly(this.board) && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: ClipboardEvent) => {
                const selectedElements = getSelectedElements(this.board);
                if (selectedElements.length > 0) {
                    event.preventDefault();
                    const rectangle = getRectangleByElements(this.board, selectedElements, false);
                    this.board.setFragment(event.clipboardData, rectangle);
                    this.board.deleteFragment(event.clipboardData);
                }
            });
    }

    private viewportScrollListener() {
        this.ngZone.runOutsideAngular(() => {
            fromEvent<MouseEvent>(this.viewportContainer.nativeElement, 'scroll')
                .pipe(
                    takeUntil(this.destroy$),
                    filter(() => {
                        if (isFromViewportChange(this.board)) {
                            setIsFromViewportChange(this.board, false);
                            return false;
                        }
                        return true;
                    })
                )
                .subscribe((event: Event) => {
                    const { scrollLeft, scrollTop } = event.target as HTMLElement;
                    const zoom = this.board.viewport.zoom;
                    const viewBox = getViewBox(this.board, zoom);
                    const origination = [scrollLeft / zoom + viewBox[0], scrollTop / zoom + viewBox[1]] as Point;
                    if (Point.isEquals(origination, this.board.viewport.origination)) {
                        return;
                    }
                    BoardTransforms.updateViewport(this.board, origination);
                    setIsFromScrolling(this.board, true);
                });
        });
    }

    private elementResizeListener() {
        this.resizeObserver = new ResizeObserver(() => {
            initializeViewportContainer(this.board);
            initializeViewBox(this.board);
            updateViewportOffset(this.board);
        });
        this.resizeObserver.observe(this.nativeElement);
    }

    private initializeIslands() {
        this.islands?.forEach(island => {
            island.initialize(this.board);
        });
    }

    private updateIslands() {
        this.islands?.forEach(island => {
            if (hasOnBoardChange(island)) {
                island.onBoardChange();
            }
            island.markForCheck();
        });
    }

    trackBy = (index: number, element: PlaitElement) => {
        return element.id;
    };

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.resizeObserver && this.resizeObserver?.disconnect();
        BOARD_TO_ROUGH_SVG.delete(this.board);
        BOARD_TO_COMPONENT.delete(this.board);
        BOARD_TO_ROUGH_SVG.delete(this.board);
        BOARD_TO_HOST.delete(this.board);
        BOARD_TO_ELEMENT_HOST.delete(this.board);
        BOARD_TO_ON_CHANGE.delete(this.board);
    }

    markForCheck() {
        this.cdr.markForCheck();
        this.ngZone.run(() => {
            this.updateIslands();
        });
    }
}
