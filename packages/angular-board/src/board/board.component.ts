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
import { BoardComponentInterface } from './board.component.interface';
import {
    BOARD_TO_AFTER_CHANGE,
    BOARD_TO_CONTEXT,
    BOARD_TO_ELEMENT_HOST,
    BOARD_TO_HOST,
    BOARD_TO_MOVING_POINT,
    BOARD_TO_MOVING_POINT_IN_BOARD,
    BOARD_TO_ON_CHANGE,
    BOARD_TO_ROUGH_SVG,
    BoardTransforms,
    HOST_CLASS_NAME,
    IS_BOARD_ALIVE,
    IS_CHROME,
    IS_FIREFOX,
    IS_SAFARI,
    ListRender,
    PlaitBoard,
    PlaitBoardContext,
    PlaitBoardOptions,
    PlaitChildrenContext,
    PlaitElement,
    PlaitPlugin,
    PlaitTheme,
    Viewport,
    WritableClipboardOperationType,
    ZOOM_STEP,
    createBoard,
    deleteFragment,
    getClipboardData,
    hasInputOrTextareaTarget,
    initializeViewBox,
    initializeViewportContainer,
    initializeViewportOffset,
    isFromViewportChange,
    isPreventTouchMove,
    setFragment,
    setIsFromViewportChange,
    toHostPoint,
    toViewBoxPoint,
    updateViewportByScrolling,
    updateViewportOffset,
    withBoard,
    withHandPointer,
    withHistory,
    withHotkey,
    withMoving,
    withOptions,
    withRelatedFragment,
    withSelection,
    withViewport
} from '@plait/core';
import { PlaitIslandBaseComponent, hasOnBoardChange } from '../island/island-base.component';
import { BOARD_TO_COMPONENT } from '../utils/weak-maps';
import { withAngular } from '../plugins/with-angular';
import { withImage, withText } from '@plait/common';
import { OnChangeData } from '../plugins/angular-board';

const ElementLowerHostClass = 'element-lower-host';
const ElementHostClass = 'element-host';
const ElementUpperHostClass = 'element-upper-host';
const ElementActiveHostClass = 'element-active-host';

@Component({
    selector: 'plait-board',
    template: `
        <div class="viewport-container" #viewportContainer>
            <svg #svg width="100%" height="100%" style="position: relative;" class="board-host-svg">
                <g class="element-lower-host"></g>
                <g class="element-host"></g>
                <g class="element-upper-host"></g>
                <g class="element-active-host"></g>
            </svg>
        </div>
        <ng-content></ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class PlaitBoardComponent implements BoardComponentInterface, OnInit, OnChanges, AfterViewInit, AfterContentInit, OnDestroy {
    hasInitialized = false;

    board!: PlaitBoard;

    roughSVG!: RoughSVG;

    destroy$ = new Subject<void>();

    private resizeObserver!: ResizeObserver;

    @Input() plaitValue: PlaitElement[] = [];

    @Input() plaitViewport!: Viewport;

    @Input() plaitPlugins: PlaitPlugin[] = [];

    @Input() plaitOptions?: PlaitBoardOptions;

    @Input() plaitTheme?: PlaitTheme;

    @Output() onChange: EventEmitter<OnChangeData> = new EventEmitter();

    @Output() plaitBoardInitialized: EventEmitter<PlaitBoard> = new EventEmitter();

    get host(): SVGSVGElement {
        return this.svg.nativeElement;
    }

    @HostBinding('class')
    get hostClass() {
        return `${HOST_CLASS_NAME} theme-${this.board.theme.themeColorMode} ${this.getBrowserClassName()}`;
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

    listRender!: ListRender;

    constructor(
        public cdr: ChangeDetectorRef,
        public viewContainerRef: ViewContainerRef,
        private elementRef: ElementRef<HTMLElement>,
        private ngZone: NgZone
    ) {}

    ngOnInit(): void {
        const elementLowerHost = this.host.querySelector(`.${ElementLowerHostClass}`) as SVGGElement;
        const elementHost = this.host.querySelector(`.${ElementHostClass}`) as SVGGElement;
        const elementUpperHost = this.host.querySelector(`.${ElementUpperHostClass}`) as SVGGElement;
        const elementActiveHost = this.host.querySelector(`.${ElementActiveHostClass}`) as SVGGElement;
        const roughSVG = rough.svg(this.host as SVGSVGElement, {
            options: { roughness: 0, strokeWidth: 1 }
        });
        this.roughSVG = roughSVG;
        this.initializePlugins();
        this.ngZone.runOutsideAngular(() => {
            this.initializeHookListener();
            this.viewportScrollListener();
            this.wheelZoomListener();
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
        IS_BOARD_ALIVE.set(this.board, true);
        BOARD_TO_ELEMENT_HOST.set(this.board, {
            lowerHost: elementLowerHost,
            host: elementHost,
            upperHost: elementUpperHost,
            activeHost: elementActiveHost,
            container: this.elementRef.nativeElement,
            viewportContainer: this.viewportContainer.nativeElement
        });
        BOARD_TO_ON_CHANGE.set(this.board, () => {
            this.ngZone.run(() => {
                this.updateListRender();
            });
        });
        BOARD_TO_AFTER_CHANGE.set(this.board, () => {
            this.ngZone.run(() => {
                const data: OnChangeData = {
                    children: this.board.children,
                    operations: this.board.operations,
                    viewport: this.board.viewport,
                    selection: this.board.selection,
                    theme: this.board.theme
                };
                this.updateIslands();
                this.onChange.emit(data);
            });
        });
        const context = new PlaitBoardContext();
        BOARD_TO_CONTEXT.set(this.board, context);
        this.initializeListRender();
        this.elementRef.nativeElement.classList.add(`pointer-${this.board.pointer}`);
        this.hasInitialized = true;
    }

    ngAfterContentInit(): void {
        this.initializeIslands();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.hasInitialized) {
            const valueChange = changes['plaitValue'];
            const options = changes['plaitOptions'];

            if (valueChange) {
                this.board.children = valueChange.currentValue;
                this.updateListRender();
            }
            if (options) {
                this.board.options = options.currentValue;
            }
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
        let board = withRelatedFragment(
            withHotkey(
                withHandPointer(
                    withHistory(
                        withSelection(
                            withMoving(
                                withBoard(
                                    withViewport(
                                        withOptions(withAngular(withImage(withText(createBoard(this.plaitValue, this.plaitOptions)))))
                                    )
                                )
                            )
                        )
                    )
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
                this.board.dblClick(event);
            });

        fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                takeUntil(this.destroy$),
                tap(event => {
                    this.board.globalKeyDown(event);
                }),
                filter(event => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board) && !hasInputOrTextareaTarget(event.target))
            )
            .subscribe((event: KeyboardEvent) => {
                this.board.keyDown(event);
            });

        fromEvent<KeyboardEvent>(document, 'keyup')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: KeyboardEvent) => {
                this.board?.keyUp(event);
            });

        fromEvent<ClipboardEvent>(document, 'copy')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: ClipboardEvent) => {
                event.preventDefault();
                setFragment(this.board, WritableClipboardOperationType.copy, event.clipboardData);
            });

        fromEvent<ClipboardEvent>(document, 'paste')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.isReadonly(this.board) && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe(async (clipboardEvent: ClipboardEvent) => {
                const mousePoint = PlaitBoard.getMovingPointInBoard(this.board);
                if (mousePoint) {
                    const targetPoint = toViewBoxPoint(this.board, toHostPoint(this.board, mousePoint[0], mousePoint[1]));
                    const clipboardData = await getClipboardData(clipboardEvent.clipboardData);
                    this.board.insertFragment(clipboardData, targetPoint, WritableClipboardOperationType.paste);
                }
            });

        fromEvent<ClipboardEvent>(document, 'cut')
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isFocused && !PlaitBoard.isReadonly(this.board) && !PlaitBoard.hasBeenTextEditing(this.board))
            )
            .subscribe((event: ClipboardEvent) => {
                event.preventDefault();
                setFragment(this.board, WritableClipboardOperationType.cut, event.clipboardData);
                deleteFragment(this.board);
            });
    }

    private initializeListRender() {
        this.listRender = new ListRender(this.board);
        this.listRender.initialize(this.board.children, this.initializeChildrenContext());
    }

    private updateListRender() {
        this.listRender.update(this.board.children, this.initializeChildrenContext());
        PlaitBoard.getBoardContext(this.board).nextStable();
    }

    private initializeChildrenContext(): PlaitChildrenContext {
        return {
            board: this.board,
            parent: this.board,
            parentG: PlaitBoard.getElementHost(this.board)
        };
    }

    private viewportScrollListener() {
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
                updateViewportByScrolling(this.board, scrollLeft, scrollTop);
            });
        fromEvent<MouseEvent>(this.viewportContainer.nativeElement, 'touchmove', { passive: false })
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: Event) => {
                if (isPreventTouchMove(this.board)) {
                    event.preventDefault();
                }
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

    private wheelZoomListener() {
        fromEvent<WheelEvent>(this.host, 'wheel', { passive: false })
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: WheelEvent) => {
                // Credits to excalidraw
                // https://github.com/excalidraw/excalidraw/blob/b7d7ccc929696cc17b4cc34452e4afd846d59f4f/src/components/App.tsx#L9060
                if (event.metaKey || event.ctrlKey) {
                    event.preventDefault();
                    const { deltaX, deltaY } = event;
                    const zoom = this.board.viewport.zoom;
                    const sign = Math.sign(deltaY);
                    const MAX_STEP = ZOOM_STEP * 100;
                    const absDelta = Math.abs(deltaY);
                    let delta = deltaY;
                    if (absDelta > MAX_STEP) {
                        delta = MAX_STEP * sign;
                    }
                    let newZoom = zoom - delta / 100;
                    // increase zoom steps the more zoomed-in we are (applies to >100% only)
                    newZoom +=
                        Math.log10(Math.max(1, zoom)) *
                        -sign *
                        // reduced amplification for small deltas (small movements on a trackpad)
                        Math.min(1, absDelta / 20);
                    BoardTransforms.updateZoom(this.board, newZoom, false);
                }
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
        IS_BOARD_ALIVE.set(this.board, false);
        BOARD_TO_ON_CHANGE.delete(this.board);
        BOARD_TO_AFTER_CHANGE.set(this.board, () => {});
    }

    markForCheck() {
        this.cdr.markForCheck();
        this.ngZone.run(() => {
            this.updateIslands();
        });
    }
}
