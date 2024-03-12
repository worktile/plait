# plait

## 0.51.4

## 0.52.0-next.0

### Minor Changes

-   [`6b6678df`](https://github.com/worktile/plait/commit/6b6678dfd65d9cfe1b80726afdd9ef4044d9202a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - bump angular into v17

## 0.51.3

### Patch Changes

-   [#770](https://github.com/worktile/plait/pull/770) [`1ad11997`](https://github.com/worktile/plait/commit/1ad11997c47f0e4ee54d9744e689d7c97cdfcafc) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support shift select in group

*   [#767](https://github.com/worktile/plait/pull/767) [`524cd91e`](https://github.com/worktile/plait/commit/524cd91efc94b8523191fdad95b3579cc4defb03) Thanks [@MissLixf](https://github.com/MissLixf)! - hit select correct with angle
    rectangle hit select correct with angle

-   [#771](https://github.com/worktile/plait/pull/771) [`1a16e813`](https://github.com/worktile/plait/commit/1a16e81385577ae69f9d0a949809f84ef113e0e1) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support addGroup and removeGroup function

*   [#769](https://github.com/worktile/plait/pull/769) [`ee1cd186`](https://github.com/worktile/plait/commit/ee1cd186d745598a629e3909b91462d567d82054) Thanks [@MissLixf](https://github.com/MissLixf)! - fix(core): fix selection contain element but not selected

-   [#764](https://github.com/worktile/plait/pull/764) [`4df58289`](https://github.com/worktile/plait/commit/4df58289a7818317fe700c803f3dd4f95840e075) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support group render and select

## 0.51.2

### Patch Changes

-   [`5679c8bd`](https://github.com/worktile/plait/commit/5679c8bd40461ca1339d334557a40930bd985689) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add return to stop moving for special scene

## 0.51.1

## 0.51.0

### Minor Changes

-   [#742](https://github.com/worktile/plait/pull/742) [`1c3cfa4d`](https://github.com/worktile/plait/commit/1c3cfa4d35c9d7b1d1c2c553546a81337e89bdfc) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - throttleRAF support set key and board to avoid the effect of multiple scene call

*   [`a76fe602`](https://github.com/worktile/plait/commit/a76fe602af45e1021ca4af22ad3df855872068c1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - replace Number.MIN_VALUE with Number.NEGATIVE_INFINITY to resolve negative number problems

-   [#714](https://github.com/worktile/plait/pull/714) [`541bd50d`](https://github.com/worktile/plait/commit/541bd50dc64477d526ca959635b2ff3ad7494f70) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - elbow-line supports dragging to adjust the inflection point
    extract getSourceAndTargetOuterRectangle to common
    extract isSourceAndTargetIntersect to common
    add isHorizontalSegment to core
    add isVerticalSegment to core
    add isPointsOnSameLine to core
    refactor getElbowPoints when points.length > 2

*   [#709](https://github.com/worktile/plait/pull/709) [`469acbd1`](https://github.com/worktile/plait/commit/469acbd1fc945b1b68497f85d112feecba29d743) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support resize entire draw elements

-   [`df5e2132`](https://github.com/worktile/plait/commit/df5e21327a172cd7cd45efbe5ee742afea43fd0d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move arrowMoving to with-moving file
    extract getTargetElements and updatePoints

*   [`a00de88e`](https://github.com/worktile/plait/commit/a00de88e9a93fe350b37fd19cf757ed078c2ad82) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move getEllipseTangentSlope and getVectorFromPointAndSlope of ellipse to utils/math
    resolve stored-data shape connection point and direction issue

-   [`7d17a9b1`](https://github.com/worktile/plait/commit/7d17a9b10eced701e2aeebd21322f1bdd15082fb) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support move elements by pointer down entire selection rectangle

### Patch Changes

-   [#744](https://github.com/worktile/plait/pull/744) [`712ccb12`](https://github.com/worktile/plait/commit/712ccb12a6113c5b59eb48b022732824ff529044) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - optimize the code for drawing equal lines
    add getDirectionFactorByDirectionComponent

*   [#737](https://github.com/worktile/plait/pull/737) [`91d1685c`](https://github.com/worktile/plait/commit/91d1685c62c4ac4b7717da315e3a32a0838f1174) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - isHorizontalSegment renamed to isOverHorizontal
    isVerticalSegment renamed to isOverVertical
    isPointsOnSameLine renamed to isAlign
    move the three method to Point instance
    move getRectangleByPoints to RectangleClient instance

-   [`de835ae1`](https://github.com/worktile/plait/commit/de835ae19e9bc26fc6d53cb1ff486b0433c3f0e7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add correctly isShift state in common with resize

*   [`3892784b`](https://github.com/worktile/plait/commit/3892784be7c9e40370a3777517b62dab27280ba4) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - the selected state is lost after Resize the element

-   [#720](https://github.com/worktile/plait/pull/720) [`e709924d`](https://github.com/worktile/plait/commit/e709924df57627663d5da1d0a04c71500943819d) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add line resize snapping effect

*   [`b5c7e4c6`](https://github.com/worktile/plait/commit/b5c7e4c6637f598a0a990167b48b5000fba806ca) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rectangle selection support shift multiple select

-   [`66219f5a`](https://github.com/worktile/plait/commit/66219f5a2c98c10da76aeb9e13cf781c90e49288) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Solve the precision issue of floating point number operations
    Extract getCornerPointsByPoints to obtain corner points (avoid obtaining corner point via floating point operations)

*   [#741](https://github.com/worktile/plait/pull/741) [`7a107ae9`](https://github.com/worktile/plait/commit/7a107ae95f02a3d20152c4e5b9184a59132715cb) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support equal line when resize

-   [`09b5f86d`](https://github.com/worktile/plait/commit/09b5f86d673fb64f0066502110b971c85831ca98) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix issue that after the line is selected, clicking on the blank area cannot make the rectangle selection

*   [`71b8f23f`](https://github.com/worktile/plait/commit/71b8f23f07ff9ebf3ec71e396ecbeafc87e6574f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - extract getBoundingRectangle in rectangle-client and refactor getRectangleByElements by getBoundingRectangle
    calculate line rectangle by texts's rectangle and line points's rectangle

-   [`5a700b54`](https://github.com/worktile/plait/commit/5a700b5499b975f16ac7d0faaefded3a04771b8a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - isPointsOnSameLine add tolerance argument

## 0.50.1

### Patch Changes

-   [#702](https://github.com/worktile/plait/pull/702) [`aff5f597`](https://github.com/worktile/plait/commit/aff5f597156f562962bf42557256ef295d2328e3) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - compat firefox contextmenu copy and fix mind image copy

## 0.50.0

### Minor Changes

-   [#699](https://github.com/worktile/plait/pull/699) [`5c2f3d28`](https://github.com/worktile/plait/commit/5c2f3d28fc7a147606d101a6a2e9c44df55a7780) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove x-plait-fragment key and use text/html as standard key

### Patch Changes

-   [#701](https://github.com/worktile/plait/pull/701) [`18790e12`](https://github.com/worktile/plait/commit/18790e1272dffe80366927c19d334837ebc34b51) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add getElementsText

*   [#700](https://github.com/worktile/plait/pull/700) [`cc08a1dc`](https://github.com/worktile/plait/commit/cc08a1dc734417f32a39d252f81103cb57c5b402) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - feat: add NavigatorClipboard handle

-   [#701](https://github.com/worktile/plait/pull/701) [`18790e12`](https://github.com/worktile/plait/commit/18790e1272dffe80366927c19d334837ebc34b51) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - refactor: uniformly handle clipboard data and add parameter for setFragment and insertFragment

## 0.49.0

### Minor Changes

-   [`8250c28a`](https://github.com/worktile/plait/commit/8250c28a0580eb06a7a1a297871df263869167fa) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - extract to-point to handle coordinate transform

## 0.48.0

### Minor Changes

-   [`580f2fc9`](https://github.com/worktile/plait/commit/580f2fc9747b10d173d28c103deb1daba71fb830) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - maintain isShift state by shiftKey of PointerEvent
    maintain isShift state by keyDown and keyUp may appear keyUp is not triggered (conflict with other application hotkey)

### Patch Changes

-   [`f17a97f8`](https://github.com/worktile/plait/commit/f17a97f8e5af366b06bac383ecfc92a9503cfc85) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix isOnlySetSelection condition in with-viewport

*   [`be9ef299`](https://github.com/worktile/plait/commit/be9ef299a5179e228c882791b624e3a2e0582de3) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - define hand and selection as setSelectionPointer and execute set_selection when pointer only is setSelectionPointer

## 0.47.0

### Minor Changes

-   [`85562abc`](https://github.com/worktile/plait/commit/85562abc2af58991c1ce50a2e140a4f72ef02942) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - skip 0.46.0

## 0.46.0

### Minor Changes

-   [`4cb6e2d8`](https://github.com/worktile/plait/commit/4cb6e2d8358f9f4a671b897289c11b4286b1b0fe) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct with-resize plugin distance error
    use keyDown record isShift

*   [#692](https://github.com/worktile/plait/pull/692) [`990a9ffd`](https://github.com/worktile/plait/commit/990a9ffdc0290ad60d4e9d751e00931a60fabeaf) Thanks [@WBbug](https://github.com/WBbug)! - support arrow move element

-   [#693](https://github.com/worktile/plait/pull/693) [`43aca57a`](https://github.com/worktile/plait/commit/43aca57aad7863102d38440afa7e585561c080eb) Thanks [@WBbug](https://github.com/WBbug)! - correct line drag condition

### Patch Changes

-   [`ae816e7e`](https://github.com/worktile/plait/commit/ae816e7ecfafa9c039566d2309d89a0ed5185017) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - resolve the text of outside board can not be selected issue

## 0.45.0

### Minor Changes

-   [#691](https://github.com/worktile/plait/pull/691) [`6f7d869c`](https://github.com/worktile/plait/commit/6f7d869c8e5343825c20547a0f90f2bfa6b1e236) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move set_selection to pointerUp

### Patch Changes

-   [#690](https://github.com/worktile/plait/pull/690) [`c311a8ba`](https://github.com/worktile/plait/commit/c311a8bad44cda7423d728b59628ab9cbcc2370b) Thanks [@WBbug](https://github.com/WBbug)! - add getRelatedFragment

## 0.44.0

### Minor Changes

-   [`77b01bc8`](https://github.com/worktile/plait/commit/77b01bc800a1ebbe68ea6f7515d3b00b719e33d7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - sort selected elements to correct elements position in export elements as image and paste elements

## 0.43.0

### Minor Changes

-   [`fd18e3f5`](https://github.com/worktile/plait/commit/fd18e3f5d3ae869e92df281a193f7780cfe99cf1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add sortElements to solve export image appear hierarchy issues

### Patch Changes

-   [`ef42363b`](https://github.com/worktile/plait/commit/ef42363b3d3d5c1dd22db40e692ac1b31bdb6eba) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add isRemoveChildren argument in removeSelectedElement
    should not remove children selected state in the ngOnChanges method of PlaitElementComponent

## 0.42.0

## 0.41.0

## 0.40.0

### Minor Changes

-   [`07eaf04d`](https://github.com/worktile/plait/commit/07eaf04d7a74f1b9fc67e5822ba01bf5e7e8e469) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add afterChange method and move the timing of plaitChange event trigging to afterChange
    overriding the afterChange method of board can handle some things between the component update and the component triggering the change event.

*   [`e90c5c21`](https://github.com/worktile/plait/commit/e90c5c2192807eae2b6d6d7c230bc4e979d4c863) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct getGapCenter method logic, add note for a-star
    improve line route demo and

-   [#674](https://github.com/worktile/plait/pull/674) [`804f9348`](https://github.com/worktile/plait/commit/804f9348179975840d9ef6a12e54e94159a1cb3a) Thanks [@WBbug](https://github.com/WBbug)! - support move text

*   [#681](https://github.com/worktile/plait/pull/681) [`98ea1c1a`](https://github.com/worktile/plait/commit/98ea1c1aa18a48ca89a66e040a523b8d30c18704) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add toScreenPoint method
    add toSVGScreenPoint method

### Patch Changes

-   [#679](https://github.com/worktile/plait/pull/679) [`2ea6ee7e`](https://github.com/worktile/plait/commit/2ea6ee7ef5199d995f67d6990cc1c106ffaa0d64) Thanks [@Maple13](https://github.com/Maple13)! - fix image node conversion error

*   [`7e587778`](https://github.com/worktile/plait/commit/7e5877784d2ae42ceb8dafc0ef5d41a6831d9544) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct selected element updating logic in with-selection

## 0.39.0

### Minor Changes

-   [`825dd399`](https://github.com/worktile/plait/commit/825dd39910458fba99298ca6c3df8fa74ff45762) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support shift select element

*   [#670](https://github.com/worktile/plait/pull/670) [`c87d653b`](https://github.com/worktile/plait/commit/c87d653bea2b9b6fcf76df1ad258796f82668b77) Thanks [@WBbug](https://github.com/WBbug)! - optimize geometry create

-   [`bcae0716`](https://github.com/worktile/plait/commit/bcae07168ed0435500671f70d8a729ad06c82473) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - change PRESS_AND_MOVE_BUFFER to 3

### Patch Changes

-   [`c3a701fc`](https://github.com/worktile/plait/commit/c3a701fc15531adbd8f77b984602e3f729b51f7c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - element selection should not be performed in readonly mode

*   [`5339b459`](https://github.com/worktile/plait/commit/5339b4594002f3fef8059b39edb86bfa806e0fd9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove child element from selected elements when remove parent element

## 0.38.0

## 0.37.0

### Minor Changes

-   [`2ca2c657`](https://github.com/worktile/plait/commit/2ca2c65710c278d3199ef62be45fef779ad17121) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move drawEmoji hook to options
    solve align and distribute line can not show

*   [`9562df03`](https://github.com/worktile/plait/commit/9562df03c7a1b5edd80090f1a97a09572dec30fc) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support line auto-complete in image element
    hide active host on moving

## 0.36.0

### Minor Changes

-   [#663](https://github.com/worktile/plait/pull/663) [`5db82bd0`](https://github.com/worktile/plait/commit/5db82bd0c196b3311d742a2ffb9c92800468f359) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move cursor class enum to core
    improve line auto complete reaction

*   [`d8a765c3`](https://github.com/worktile/plait/commit/d8a765c33f44f5df6fd9dbf0b88f8d0a48368204) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add readonly condition before edit board

-   [#658](https://github.com/worktile/plait/pull/658) [`a8fe6593`](https://github.com/worktile/plait/commit/a8fe65932fa5e499223a83fd4a74cf6a480a0953) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move active g to element active host
    replace mouse event with pointer event in with-abstract-resize

*   [#660](https://github.com/worktile/plait/pull/660) [`dc6c7c89`](https://github.com/worktile/plait/commit/dc6c7c89aa98d021060cfa02d530685892f38359) Thanks [@WBbug](https://github.com/WBbug)! - change auto complete style

### Patch Changes

-   [#654](https://github.com/worktile/plait/pull/654) [`ddb80c85`](https://github.com/worktile/plait/commit/ddb80c853ad253d17a2822c7fb23789756e78197) Thanks [@Maple13](https://github.com/Maple13)! - support exporting some data as pictures

*   [#664](https://github.com/worktile/plait/pull/664) [`6c4973b4`](https://github.com/worktile/plait/commit/6c4973b4c0ba73fa9f7404f3cd7f9b28faff3ce9) Thanks [@WBbug](https://github.com/WBbug)! - add point when points is one

## 0.35.0

### Minor Changes

-   [`66762a2d`](https://github.com/worktile/plait/commit/66762a2d924848038936895a46e42dd5d0d9828f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support wheel zoom

## 0.34.0

### Minor Changes

-   [`f60afdcc`](https://github.com/worktile/plait/commit/f60afdcc8e1b82ec861b7822c327fd307413109b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - added viewport boundary case handling

    1.the target viewport is outside the current svg coordinate system

    2.correct origination when container scroll distance does not change

## 0.33.0

### Minor Changes

-   [#636](https://github.com/worktile/plait/pull/636) [`6c2a693b`](https://github.com/worktile/plait/commit/6c2a693b75c6637067e624f1386bb1da43d219c2) Thanks [@WBbug](https://github.com/WBbug)! - support auto complete

*   [#644](https://github.com/worktile/plait/pull/644) [`41887e53`](https://github.com/worktile/plait/commit/41887e535a39ef85773f53265891c455c78b20d7) Thanks [@WBbug](https://github.com/WBbug)! - change curve points

## 0.32.0

### Minor Changes

-   [#634](https://github.com/worktile/plait/pull/634) [`c096f853`](https://github.com/worktile/plait/commit/c096f8538a72eb7daab8821c7784f4de3d9f7e9d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent text from being selected when user pressed shift and pointer down

*   [#634](https://github.com/worktile/plait/pull/634) [`8bf33508`](https://github.com/worktile/plait/commit/8bf33508a704e26c37436c453f14882aa5112953) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove selected element if include

-   [#634](https://github.com/worktile/plait/pull/634) [`3d9ae405`](https://github.com/worktile/plait/commit/3d9ae4057a3d0bfb617a23ea302c50b3cbe42c3f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add user-select: node in firefox browser

*   [#628](https://github.com/worktile/plait/pull/628) [`d41b1341`](https://github.com/worktile/plait/commit/d41b134155ddefeb82570c7202847423d733095d) Thanks [@WBbug](https://github.com/WBbug)! - optimize line when stroke wider

### Patch Changes

-   [`74641dae`](https://github.com/worktile/plait/commit/74641dae56bd04c9bbeefadf397def825691ecf1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve hit text logic

*   [#632](https://github.com/worktile/plait/pull/632) [`4acfa3a0`](https://github.com/worktile/plait/commit/4acfa3a054893e939baaf08155506c1dca5a163a) Thanks [@WBbug](https://github.com/WBbug)! - fix get wrong corner count

-   [`74641dae`](https://github.com/worktile/plait/commit/74641dae56bd04c9bbeefadf397def825691ecf1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - return empty array when selection is null

*   [#630](https://github.com/worktile/plait/pull/630) [`1318ef90`](https://github.com/worktile/plait/commit/1318ef90f4aa13f4e71540bdd2c50170ad7ab990) Thanks [@WBbug](https://github.com/WBbug)! - fix get wrong rectangle when has line bound

-   [#634](https://github.com/worktile/plait/pull/634) [`2e705a5d`](https://github.com/worktile/plait/commit/2e705a5d1689959789101f09eb1e3a9e1600b853) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - set free selection when set temporary selected element

## 0.31.0

### Minor Changes

-   [#627](https://github.com/worktile/plait/pull/627) [`dfb55270`](https://github.com/worktile/plait/commit/dfb552706df93ba6797004c4746fb1aff3e45924) Thanks [@WBbug](https://github.com/WBbug)! - support resize by moving border

*   [#626](https://github.com/worktile/plait/pull/626) [`25d16ed9`](https://github.com/worktile/plait/commit/25d16ed9f2e39f0748cb7d7fe4c4d43736ed459a) Thanks [@WBbug](https://github.com/WBbug)! - adjust when resize line

## 0.30.0

### Minor Changes

-   [`8eae35a8`](https://github.com/worktile/plait/commit/8eae35a8440b00f29d9349a8ad6ea87ae4cb01ce) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename isHitSelection to isRectangleHit

*   [`0589514b`](https://github.com/worktile/plait/commit/0589514ba6ddadf6afa735ee66b02501fbcaca9a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - resolve inflict between with-moving and with node dnd of mind

-   [`882c5e1e`](https://github.com/worktile/plait/commit/882c5e1e247d5411c9f8f7527acad910301a479b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move cached element of focused image to common
    add override function isImageBindingAllowed

*   [#620](https://github.com/worktile/plait/pull/620) [`c02e846c`](https://github.com/worktile/plait/commit/c02e846c615afe44d474da5eaf97da93646c045a) Thanks [@WBbug](https://github.com/WBbug)! - add a-star algorithms

-   [#624](https://github.com/worktile/plait/pull/624) [`51591399`](https://github.com/worktile/plait/commit/515913995e35f9567c1125c18fcb427b9d8817db) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove range interface and remove ranges from selection

*   [`09c7083a`](https://github.com/worktile/plait/commit/09c7083af9f52ee6b6bef70dad99c68da4ad1e3e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add overridable function isHit

-   [#624](https://github.com/worktile/plait/pull/624) [`51591399`](https://github.com/worktile/plait/commit/515913995e35f9567c1125c18fcb427b9d8817db) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - use isHit and isRectangle to distinguish hit solid element or hit rectangle area of element

## 0.29.0

## 0.28.0

### Minor Changes

-   release 0.28.0

## 0.24.0

### Minor Changes

-   [`653109b8`](https://github.com/worktile/plait/commit/653109b836c5707ec03714a801e3a167ad4e6263) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle touch target to avoid touch move event not fire

*   [`b8c9d871`](https://github.com/worktile/plait/commit/b8c9d8718f02af6a15161b044ba7cc6c6a6990a9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - do not show resize handle for geometry when isSelectionMoving is true
    do not show resize handle for geometry text when text is editing

-   [#550](https://github.com/worktile/plait/pull/550) [`d0a1452a`](https://github.com/worktile/plait/commit/d0a1452a2c1bb0025442e5a9a0f6bc84257cf97d) Thanks [@WBbug](https://github.com/WBbug)! - support reaction on geometry

*   [#583](https://github.com/worktile/plait/pull/583) [`ddff5ac9`](https://github.com/worktile/plait/commit/ddff5ac9f0982a3378066a24869e4f30f38e160e) Thanks [@WBbug](https://github.com/WBbug)! - support move reaction draw align lines

-   [#593](https://github.com/worktile/plait/pull/593) [`3af9ce2a`](https://github.com/worktile/plait/commit/3af9ce2ad2a034152a90847007a99d6b8009e64b) Thanks [@WBbug](https://github.com/WBbug)! - support vertical distribute

*   [#548](https://github.com/worktile/plait/pull/548) [`b52dadc3`](https://github.com/worktile/plait/commit/b52dadc3ca405b343bd8f48d8cb2d95776df9f2e) Thanks [@WBbug](https://github.com/WBbug)! - add text mask

-   [`5e4c5d25`](https://github.com/worktile/plait/commit/5e4c5d25a3797e9f77d9efad2b6ad7016fa59b11) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve geometry drawing style

*   [`3f8d541a`](https://github.com/worktile/plait/commit/3f8d541a6b7fa2257e42ce9048f9e4eff8f255e4) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - select elements which were inserted from clipboard

-   [`c49f5ec1`](https://github.com/worktile/plait/commit/c49f5ec1d46a06770692a2b52c6bbc43c1c10786) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - use plaitChange replace onChange to handle island base

*   [`bc9efa35`](https://github.com/worktile/plait/commit/bc9efa3570703860be0ef8824c20a8cb4c56d904) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename folder name from plait to core

-   [`35bd204d`](https://github.com/worktile/plait/commit/35bd204d14045988163b9de7f3ad6ff0dabeed4a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename utils to common
    rename drawer to generator
    geometry support moving and active state

*   [`ab975ceb`](https://github.com/worktile/plait/commit/ab975ceba46293d77c46c453d3b0da7607b0ac3b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support copy and paste line and handle boundId

-   [#585](https://github.com/worktile/plait/pull/585) [`ba6d2eeb`](https://github.com/worktile/plait/commit/ba6d2eebcb0928a2637e57effe70447b36f5cd80) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve line handle direction logic

*   [#531](https://github.com/worktile/plait/pull/531) [`6f41359c`](https://github.com/worktile/plait/commit/6f41359c5e20162e0ce92eb34f9e0b396905d0df) Thanks [@WBbug](https://github.com/WBbug)! - support create and select line

-   [#586](https://github.com/worktile/plait/pull/586) [`3b8a65f7`](https://github.com/worktile/plait/commit/3b8a65f7bb346c9211c9a280bd95748111bda610) Thanks [@WBbug](https://github.com/WBbug)! - add distribute lines

*   [#599](https://github.com/worktile/plait/pull/599) [`bcdbf6ee`](https://github.com/worktile/plait/commit/bcdbf6eecc14140ae6bf8ca9d43580e4a4a8b22e) Thanks [@WBbug](https://github.com/WBbug)! - change name

-   [#516](https://github.com/worktile/plait/pull/516) [`d878a467`](https://github.com/worktile/plait/commit/d878a467233b9f894a2fed562800eb6007cfbc3e) Thanks [@WBbug](https://github.com/WBbug)! - support create rectangle

*   [#581](https://github.com/worktile/plait/pull/581) [`ae4c3174`](https://github.com/worktile/plait/commit/ae4c31740c21350501b6ba4c117525a1c27cbec6) Thanks [@WBbug](https://github.com/WBbug)! - change draw outer selection and draw line-active

-   [#565](https://github.com/worktile/plait/pull/565) [`4591b267`](https://github.com/worktile/plait/commit/4591b267647a9b9d959c384b2e45cf796d75687a) Thanks [@WBbug](https://github.com/WBbug)! - change mind creation

*   [`2300b4f7`](https://github.com/worktile/plait/commit/2300b4f7853b033df85a7e01b837a810bb5453ec) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add override function getDeletedFragment and handle deleted element by the return result of getDeletedFragment

-   [`ba8e59c4`](https://github.com/worktile/plait/commit/ba8e59c4c6c7180ea3b9b7ec31a58075dd57f1ff) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - draw geometry support resize

*   [`42cdd3bd`](https://github.com/worktile/plait/commit/42cdd3bd692712c6a117b780a135fff863e4abed) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support draw-element copy and paste

-   [`f2b506ee`](https://github.com/worktile/plait/commit/f2b506ee18e614b9a5087ae64dd0188b5f80439c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - setFragment support type property
    handle bound geometry element for line element

*   [`aedbae54`](https://github.com/worktile/plait/commit/aedbae5464735592f7682335c14cf1e733b9e46d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update geometry stroke width generate logic

-   [#536](https://github.com/worktile/plait/pull/536) [`abf36572`](https://github.com/worktile/plait/commit/abf365723493220ae3c06461a93a38935272e1c7) Thanks [@WBbug](https://github.com/WBbug)! - support line bound geometry

*   [#589](https://github.com/worktile/plait/pull/589) [`1af013ed`](https://github.com/worktile/plait/commit/1af013edf83f5499314ead60424eaab23fb1764e) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support standalone component

-   [#570](https://github.com/worktile/plait/pull/570) [`603767ce`](https://github.com/worktile/plait/commit/603767ce4824b4683bfb61a277487ab9e74d8157) Thanks [@WBbug](https://github.com/WBbug)! - support some arrows

*   [#526](https://github.com/worktile/plait/pull/526) [`9b2cc192`](https://github.com/worktile/plait/commit/9b2cc192c0dca93aedb51b489f6d11e98e1ba6d5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add common with resize and common active generator

-   [`df94abc0`](https://github.com/worktile/plait/commit/df94abc0a5957e868844fa541a60045b404a84d6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve line arrow drawing

*   [`06a3a57d`](https://github.com/worktile/plait/commit/06a3a57deac23520b9a0b535e27ca7aaf1f0ef8b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - `draw`: support draw elements delete
    `core`: invoke deleteFragment when use press delete or backspace

-   [`6584bc3f`](https://github.com/worktile/plait/commit/6584bc3ffd5370c6409267ec2a2ab610809e9227) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - redraw line when bounded elements changed

### Patch Changes

-   [`54d91509`](https://github.com/worktile/plait/commit/54d9150934ddd67fabd705e4a2bc1c43caf06fe0) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - solve can not copy and cut mind node image

*   [#592](https://github.com/worktile/plait/pull/592) [`832689e4`](https://github.com/worktile/plait/commit/832689e4b0d41c78136b33bc79244e01c670c24f) Thanks [@Maple13](https://github.com/Maple13)! - build: update peerDependencies

-   [`0809ac7a`](https://github.com/worktile/plait/commit/0809ac7aace91baf643737bb798b6171cb3217c8) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent default action when invoke deleteFragment in keyDown

*   [#578](https://github.com/worktile/plait/pull/578) [`85a99741`](https://github.com/worktile/plait/commit/85a9974106769b777ca805c372c795765937f463) Thanks [@WBbug](https://github.com/WBbug)! - add stroke line dash

-   [#605](https://github.com/worktile/plait/pull/605) [`ebb02083`](https://github.com/worktile/plait/commit/ebb02083e75124e74485d399d7258125cdb818bb) Thanks [@WBbug](https://github.com/WBbug)! - add isAlign

*   [`8e257d5b`](https://github.com/worktile/plait/commit/8e257d5b0e184b9d0b2dddd033b82dd384834d25) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle text touch moving action

-   [#549](https://github.com/worktile/plait/pull/549) [`89a02986`](https://github.com/worktile/plait/commit/89a02986166c9499e18c51f1f58c231a02c874ba) Thanks [@xinglu01](https://github.com/xinglu01)! - export styles by core

*   [#588](https://github.com/worktile/plait/pull/588) [`6f43b941`](https://github.com/worktile/plait/commit/6f43b941a8ec94eec8e59e971ae24790182ac137) Thanks [@WBbug](https://github.com/WBbug)! - change handleAlign position

-   [#607](https://github.com/worktile/plait/pull/607) [`fecb35b0`](https://github.com/worktile/plait/commit/fecb35b031c3cd13316870f610a2a13c60def4e2) Thanks [@Maple13](https://github.com/Maple13)! - optimized rendering of image elements in content when converted to images

*   [`4c03af2b`](https://github.com/worktile/plait/commit/4c03af2b7f53672b4cb2c4a88434efa7762e0afe) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - invoke preventTouchMove as moving elements

-   [`ec9c4216`](https://github.com/worktile/plait/commit/ec9c4216a40ff531a96b453a3a9f386170e0a97d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix alignment property display in editing

## 0.24.0-next.13

### Minor Changes

-   [#599](https://github.com/worktile/plait/pull/599) [`bcdbf6ee`](https://github.com/worktile/plait/commit/bcdbf6eecc14140ae6bf8ca9d43580e4a4a8b22e) Thanks [@WBbug](https://github.com/WBbug)! - change name

*   [#589](https://github.com/worktile/plait/pull/589) [`1af013ed`](https://github.com/worktile/plait/commit/1af013edf83f5499314ead60424eaab23fb1764e) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support standalone component

### Patch Changes

-   [#605](https://github.com/worktile/plait/pull/605) [`ebb02083`](https://github.com/worktile/plait/commit/ebb02083e75124e74485d399d7258125cdb818bb) Thanks [@WBbug](https://github.com/WBbug)! - add isAlign

*   [#607](https://github.com/worktile/plait/pull/607) [`fecb35b0`](https://github.com/worktile/plait/commit/fecb35b031c3cd13316870f610a2a13c60def4e2) Thanks [@Maple13](https://github.com/Maple13)! - optimized rendering of image elements in content when converted to images

## 0.24.0-next.12

### Minor Changes

-   [#593](https://github.com/worktile/plait/pull/593) [`3af9ce2a`](https://github.com/worktile/plait/commit/3af9ce2ad2a034152a90847007a99d6b8009e64b) Thanks [@WBbug](https://github.com/WBbug)! - support vertical distribute

## 0.24.0-next.11

### Minor Changes

-   [#585](https://github.com/worktile/plait/pull/585) [`ba6d2eeb`](https://github.com/worktile/plait/commit/ba6d2eebcb0928a2637e57effe70447b36f5cd80) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve line handle direction logic

*   [#586](https://github.com/worktile/plait/pull/586) [`3b8a65f7`](https://github.com/worktile/plait/commit/3b8a65f7bb346c9211c9a280bd95748111bda610) Thanks [@WBbug](https://github.com/WBbug)! - add distribute lines

### Patch Changes

-   [#592](https://github.com/worktile/plait/pull/592) [`832689e4`](https://github.com/worktile/plait/commit/832689e4b0d41c78136b33bc79244e01c670c24f) Thanks [@Maple13](https://github.com/Maple13)! - build: update peerDependencies

*   [#588](https://github.com/worktile/plait/pull/588) [`6f43b941`](https://github.com/worktile/plait/commit/6f43b941a8ec94eec8e59e971ae24790182ac137) Thanks [@WBbug](https://github.com/WBbug)! - change handleAlign position

## 0.24.0-next.10

### Minor Changes

-   [#583](https://github.com/worktile/plait/pull/583) [`ddff5ac9`](https://github.com/worktile/plait/commit/ddff5ac9f0982a3378066a24869e4f30f38e160e) Thanks [@WBbug](https://github.com/WBbug)! - support move reaction draw align lines

*   [`3f8d541a`](https://github.com/worktile/plait/commit/3f8d541a6b7fa2257e42ce9048f9e4eff8f255e4) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - select elements which were inserted from clipboard

-   [#581](https://github.com/worktile/plait/pull/581) [`ae4c3174`](https://github.com/worktile/plait/commit/ae4c31740c21350501b6ba4c117525a1c27cbec6) Thanks [@WBbug](https://github.com/WBbug)! - change draw outer selection and draw line-active

*   [`f2b506ee`](https://github.com/worktile/plait/commit/f2b506ee18e614b9a5087ae64dd0188b5f80439c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - setFragment support type property
    handle bound geometry element for line element

## 0.24.0-next.9

### Patch Changes

-   [#578](https://github.com/worktile/plait/pull/578) [`85a99741`](https://github.com/worktile/plait/commit/85a9974106769b777ca805c372c795765937f463) Thanks [@WBbug](https://github.com/WBbug)! - add stroke line dash

*   [`8e257d5b`](https://github.com/worktile/plait/commit/8e257d5b0e184b9d0b2dddd033b82dd384834d25) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle text touch moving action

## 0.24.0-next.8

### Minor Changes

-   [`653109b8`](https://github.com/worktile/plait/commit/653109b836c5707ec03714a801e3a167ad4e6263) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle touch target to avoid touch move event not fire

*   [`c49f5ec1`](https://github.com/worktile/plait/commit/c49f5ec1d46a06770692a2b52c6bbc43c1c10786) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - use plaitChange replace onChange to handle island base

-   [`aedbae54`](https://github.com/worktile/plait/commit/aedbae5464735592f7682335c14cf1e733b9e46d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update geometry stroke width generate logic

*   [#570](https://github.com/worktile/plait/pull/570) [`603767ce`](https://github.com/worktile/plait/commit/603767ce4824b4683bfb61a277487ab9e74d8157) Thanks [@WBbug](https://github.com/WBbug)! - support some arrows

### Patch Changes

-   [`4c03af2b`](https://github.com/worktile/plait/commit/4c03af2b7f53672b4cb2c4a88434efa7762e0afe) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - invoke preventTouchMove as moving elements

## 0.24.0-next.7

### Minor Changes

-   [`2300b4f7`](https://github.com/worktile/plait/commit/2300b4f7853b033df85a7e01b837a810bb5453ec) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add override function getDeletedFragment and handle deleted element by the return result of getDeletedFragment

## 0.24.0-next.6

### Minor Changes

-   [`ab975ceb`](https://github.com/worktile/plait/commit/ab975ceba46293d77c46c453d3b0da7607b0ac3b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support copy and paste line and handle boundId

### Patch Changes

-   [`0809ac7a`](https://github.com/worktile/plait/commit/0809ac7aace91baf643737bb798b6171cb3217c8) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent default action when invoke deleteFragment in keyDown

## 0.24.0-next.5

### Minor Changes

-   [`5e4c5d25`](https://github.com/worktile/plait/commit/5e4c5d25a3797e9f77d9efad2b6ad7016fa59b11) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve geometry drawing style

*   [#565](https://github.com/worktile/plait/pull/565) [`4591b267`](https://github.com/worktile/plait/commit/4591b267647a9b9d959c384b2e45cf796d75687a) Thanks [@WBbug](https://github.com/WBbug)! - change mind creation

-   [`df94abc0`](https://github.com/worktile/plait/commit/df94abc0a5957e868844fa541a60045b404a84d6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve line arrow drawing

## 0.24.0-next.4

### Minor Changes

-   [`b8c9d871`](https://github.com/worktile/plait/commit/b8c9d8718f02af6a15161b044ba7cc6c6a6990a9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - do not show resize handle for geometry when isSelectionMoving is true
    do not show resize handle for geometry text when text is editing

*   [#550](https://github.com/worktile/plait/pull/550) [`d0a1452a`](https://github.com/worktile/plait/commit/d0a1452a2c1bb0025442e5a9a0f6bc84257cf97d) Thanks [@WBbug](https://github.com/WBbug)! - support reaction on geometry

### Patch Changes

-   [`ec9c4216`](https://github.com/worktile/plait/commit/ec9c4216a40ff531a96b453a3a9f386170e0a97d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix alignment property display in editing

## 0.24.0-next.3

### Minor Changes

-   [#548](https://github.com/worktile/plait/pull/548) [`b52dadc3`](https://github.com/worktile/plait/commit/b52dadc3ca405b343bd8f48d8cb2d95776df9f2e) Thanks [@WBbug](https://github.com/WBbug)! - add text mask

*   [#536](https://github.com/worktile/plait/pull/536) [`abf36572`](https://github.com/worktile/plait/commit/abf365723493220ae3c06461a93a38935272e1c7) Thanks [@WBbug](https://github.com/WBbug)! - support line bound geometry

-   [`6584bc3f`](https://github.com/worktile/plait/commit/6584bc3ffd5370c6409267ec2a2ab610809e9227) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - redraw line when bounded elements changed

### Patch Changes

-   [#549](https://github.com/worktile/plait/pull/549) [`89a02986`](https://github.com/worktile/plait/commit/89a02986166c9499e18c51f1f58c231a02c874ba) Thanks [@xinglu01](https://github.com/xinglu01)! - export styles by core

## 0.24.0-next.2

### Minor Changes

-   [#531](https://github.com/worktile/plait/pull/531) [`6f41359c`](https://github.com/worktile/plait/commit/6f41359c5e20162e0ce92eb34f9e0b396905d0df) Thanks [@WBbug](https://github.com/WBbug)! - support create and select line

*   [`ba8e59c4`](https://github.com/worktile/plait/commit/ba8e59c4c6c7180ea3b9b7ec31a58075dd57f1ff) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - draw geometry support resize

## 0.24.0-next.1

### Patch Changes

-   [`54d91509`](https://github.com/worktile/plait/commit/54d9150934ddd67fabd705e4a2bc1c43caf06fe0) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - solve can not copy and cut mind node image

## 0.24.0-next.0

### Minor Changes

-   [`bc9efa35`](https://github.com/worktile/plait/commit/bc9efa3570703860be0ef8824c20a8cb4c56d904) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename folder name from plait to core

*   [`35bd204d`](https://github.com/worktile/plait/commit/35bd204d14045988163b9de7f3ad6ff0dabeed4a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename utils to common
    rename drawer to generator
    geometry support moving and active state

-   [#516](https://github.com/worktile/plait/pull/516) [`d878a467`](https://github.com/worktile/plait/commit/d878a467233b9f894a2fed562800eb6007cfbc3e) Thanks [@WBbug](https://github.com/WBbug)! - support create rectangle

*   [`42cdd3bd`](https://github.com/worktile/plait/commit/42cdd3bd692712c6a117b780a135fff863e4abed) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support draw-element copy and paste

-   [#526](https://github.com/worktile/plait/pull/526) [`9b2cc192`](https://github.com/worktile/plait/commit/9b2cc192c0dca93aedb51b489f6d11e98e1ba6d5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add common with resize and common active generator

*   [`06a3a57d`](https://github.com/worktile/plait/commit/06a3a57deac23520b9a0b535e27ca7aaf1f0ef8b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - `draw`: support draw elements delete
    `core`: invoke deleteFragment when use press delete or backspace

## 0.23.0

### Minor Changes

-   [`eed884fb`](https://github.com/worktile/plait/commit/eed884fbde6aaa48b103d23a1bfc13a89b310e53) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move preventDefault from mouse down to mouse move

## 0.22.0

### Minor Changes

-   [#509](https://github.com/worktile/plait/pull/509) [`1231d720`](https://github.com/worktile/plait/commit/1231d720caa5ee2f1f4d3e798f2e413952104bff) Thanks [@WBbug](https://github.com/WBbug)! - support deleteFragment and setFragment in image

### Patch Changes

-   [`af0f37f4`](https://github.com/worktile/plait/commit/af0f37f4990b4bc88da0cf36c822c61aff7218d1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix mind node image style in safari
    add browser class on board native element

## 0.21.0

### Minor Changes

-   [#505](https://github.com/worktile/plait/pull/505) [`70035fcb`](https://github.com/worktile/plait/commit/70035fcbf6ef60b68248b6acc8a7b3b19db93772) Thanks [@WBbug](https://github.com/WBbug)! - add PlaitContextService in core, add image functions in mind

### Patch Changes

-   [#500](https://github.com/worktile/plait/pull/500) [`6ea3fce0`](https://github.com/worktile/plait/commit/6ea3fce0129ff4a8cffbacaa4b0bea66b40f3e80) Thanks [@WBbug](https://github.com/WBbug)! - clear selection when select emoji and image

*   [#507](https://github.com/worktile/plait/pull/507) [`dbfb2af2`](https://github.com/worktile/plait/commit/dbfb2af268554e25b83456f8bdbb94130f2b4beb) Thanks [@WBbug](https://github.com/WBbug)! - move ImageEntry to core

-   [#501](https://github.com/worktile/plait/pull/501) [`d001e696`](https://github.com/worktile/plait/commit/d001e69660b5db75d862378e39873a6b73ecb40a) Thanks [@xinglu01](https://github.com/xinglu01)! - support dom layered rendering

## 0.20.0

### Minor Changes

-   [#491](https://github.com/worktile/plait/pull/491) [`540995b3`](https://github.com/worktile/plait/commit/540995b3bdd5677a674e96d2f529afb11d2b4924) Thanks [@WBbug](https://github.com/WBbug)! - clear imageFocus when click outside

## 0.19.0

### Minor Changes

-   [`f7f0267c`](https://github.com/worktile/plait/commit/f7f0267cf216bd30898a217ee3fc75b44dfbc28e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add mind node resize plugin

*   [`e88eb2cc`](https://github.com/worktile/plait/commit/e88eb2cca2ec537e9f8fc9eed9571f6fce1f9613) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent text from being selected when the user presses main pointer and is moving
    it is decided by plugin layer whether to allow the user to select text when they press the main pointer on text element

## 0.18.0

### Minor Changes

-   [`f0806da1`](https://github.com/worktile/plait/commit/f0806da12559a5e7757d5c4696d91c58c4df7dc4) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getIsRecursionFunc

## 0.17.0

### Minor Changes

-   [`164997a1`](https://github.com/worktile/plait/commit/164997a1ad4c1ff3dee7fb2413864cb49c00f529) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - draw active mind-node by stroke width
    remove abstract handle in applyTheme

### Patch Changes

-   [`2e18752c`](https://github.com/worktile/plait/commit/2e18752cc8ddd3b0d7168a3560302dfd561cc4a6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modify mind node rectangle-shape radius

## 0.16.1

### Patch Changes

-   [`4b9b3f83`](https://github.com/worktile/plait/commit/4b9b3f8319d483172c40bf961f920a0acdb2051d) Thanks [@WBbug](https://github.com/WBbug)! - return when select board

## 0.16.0

### Minor Changes

-   [`d69471eb`](https://github.com/worktile/plait/commit/d69471eb187d15bdda129d338ef9a760ccdbfc8d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor get next selected element logic

## 0.15.1

### Patch Changes

-   [`884a06f9`](https://github.com/worktile/plait/commit/884a06f9c1b8f8ab88b16b4e3ce2b427a36d8ffc) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix hotkey import error

## 0.15.0

### Minor Changes

-   [`38376389`](https://github.com/worktile/plait/commit/38376389ea98cbcf92dfea227a3295fb7c1addd2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve moving point:
    BOARD_TO_MOVING_POINT_IN_BOARD sa point in board and will clear when mouse leave board
    BOARD_TO_MOVING_POINT as point in document and will clear when mouse leave document

*   [#462](https://github.com/worktile/plait/pull/462) [`d012c9b4`](https://github.com/worktile/plait/commit/d012c9b4f38c01af6abc2b804518ada13ac65434) Thanks [@WBbug](https://github.com/WBbug)! - add withHotKey plugin

### Patch Changes

-   [#461](https://github.com/worktile/plait/pull/461) [`2760bbaa`](https://github.com/worktile/plait/commit/2760bbaaf113a9e72e305887e7e21f6350c39913) Thanks [@WBbug](https://github.com/WBbug)! - add drawBezierPath to fix draw indent-link

## 0.14.0

### Minor Changes

-   [`e731e703`](https://github.com/worktile/plait/commit/e731e703c29910734c4f80ee138eb9c9a3f960c4) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add PlaitIslandPopoverBaseComponent to support popover case

## 0.13.0

### Minor Changes

-   [#454](https://github.com/worktile/plait/pull/454) [`da41655`](https://github.com/worktile/plait/commit/da416559d5f517f43e69a75b7b3db6afdadab437) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor with-mind-hotkey logic
    Add util methods about testing
    Add unit tests about with-mind-hotkey

## 0.12.1

### Patch Changes

-   [`d3c392c`](https://github.com/worktile/plait/commit/d3c392ce9bd48e65d6f0d7f49c2e8a4bb7597e08) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - getHitElements add match options
    add layer concept in with node dnd and filter invalid selected elements

## 0.12.0

### Minor Changes

-   [#441](https://github.com/worktile/plait/pull/441) [`d4ab01b`](https://github.com/worktile/plait/commit/d4ab01bada6f4a27fb38a1029ec1ea2feded4ccb) Thanks [@Maple13](https://github.com/Maple13)! - add to image util

## 0.11.0

### Minor Changes

-   [`bab1d19`](https://github.com/worktile/plait/commit/bab1d19de20311ed7eafd7f55088fa288d6d931b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support fit viewport width

### Patch Changes

-   [`fcaf818`](https://github.com/worktile/plait/commit/fcaf818d50e2789c67607214dc10ab27161bc3cc) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle correctly order when hit element

## 0.10.0

### Minor Changes

-   [#430](https://github.com/worktile/plait/pull/430) [`372ecab`](https://github.com/worktile/plait/commit/372ecabf88382c58382d992f3041e45b9aac7584) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - replace richtext component by slate-angular

*   [#430](https://github.com/worktile/plait/pull/430) [`275f9ce`](https://github.com/worktile/plait/commit/275f9ce077b652f7cd01fb6c994034243aea7742) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add format text

-   [#430](https://github.com/worktile/plait/pull/430) [`7adcf10`](https://github.com/worktile/plait/commit/7adcf1003d699d61bab5512f5e72817697270a19) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename richtext to text

*   [#430](https://github.com/worktile/plait/pull/430) [`81d3d9d`](https://github.com/worktile/plait/commit/81d3d9d2e628ad1d41488516b2ffec2aad4dc69c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename richtext to text

-   [#434](https://github.com/worktile/plait/pull/434) [`3d758a8`](https://github.com/worktile/plait/commit/3d758a8caef7e6c6d1fa41a11fe59decf784ae31) Thanks [@WBbug](https://github.com/WBbug)! - support change text mark

## 0.9.0

### Patch Changes

-   [#428](https://github.com/worktile/plait/pull/428) [`413bd18`](https://github.com/worktile/plait/commit/413bd18b33992a19df4337538323cccce4db93b9) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add offsetBuffer

*   [`ba049cc`](https://github.com/worktile/plait/commit/ba049cca9980ba2f763700a85b037c0699c4fa75) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - simplify viewBox calculate logic and use real scrollbar when fit viewport

## 0.8.0

### Patch Changes

-   [`740b1cd`](https://github.com/worktile/plait/commit/740b1cdc7ce1691266a77e304da6915795eb8db8) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent text from being selected

*   [`146f3d9`](https://github.com/worktile/plait/commit/146f3d999308b193e40a80a19303c3e4f148502e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modify the condition of prevent text from being selected

## 0.6.0

### Minor Changes

-   [#408](https://github.com/worktile/plait/pull/408) [`3512152`](https://github.com/worktile/plait/commit/3512152c9ab4db9a904f394539ccd2f073f6c4b7) Thanks [@WBbug](https://github.com/WBbug)! - add ThemeColor and MindThemeColor

*   [`d3d5d40`](https://github.com/worktile/plait/commit/d3d5d4080f91ce1b2cfd0bcee87f53a7dd4978c6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support board hotkey and mind hotkey

-   [#413](https://github.com/worktile/plait/pull/413) [`675a29e`](https://github.com/worktile/plait/commit/675a29ed9a1e267bcc8a9dcec8742b3b14fcd802) Thanks [@WBbug](https://github.com/WBbug)! - let core and mind support change themeColor

*   [#416](https://github.com/worktile/plait/pull/416) [`b6a4f22`](https://github.com/worktile/plait/commit/b6a4f2252144dfd313e80aa9ca79763531cfc4d1) Thanks [@WBbug](https://github.com/WBbug)! - add theme in PlaitBoardChangeEvent

### Patch Changes

-   [`f5c8410`](https://github.com/worktile/plait/commit/f5c8410b161110a911ae879da6efc61f396fb515) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - initialize theme color

*   [`8a9dcac`](https://github.com/worktile/plait/commit/8a9dcaca3f133d7f0e025dfe004576375b0c02b3) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - get correctly rectangle on element is empty

## 0.5.0

### Patch Changes

-   [`e240a98`](https://github.com/worktile/plait/commit/e240a98accd4d3eddd82318c9f067a342044993f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - just set moving point when mouse move on host

*   [`811e36f`](https://github.com/worktile/plait/commit/811e36f9d46f1e01d972453e0ad17b9da027fa89) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Add the `disabledScrollOnNonFocus` option to control whether scrolling is allowed when the board is not focused.

-   [`d40e5b0`](https://github.com/worktile/plait/commit/d40e5b08624b5d289763eb24bf7bbc4c7fb58058) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support isDisabledSelect option within withSelection
    set isDisabledSelect on mouse down emoji and create mind

## 0.4.0

### Minor Changes

-   [#394](https://github.com/worktile/plait/pull/394) [`fffc901`](https://github.com/worktile/plait/commit/fffc901674f3841461dff8c9e28dd20efe9a5754) Thanks [@WBbug](https://github.com/WBbug)! - support draw polyline

*   [`990061a`](https://github.com/worktile/plait/commit/990061ae5d59668482faff37129c6b91e476b88a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support base island to implement toolbar or others property modify
    remove toolbar from core

-   [#397](https://github.com/worktile/plait/pull/397) [`b172f35`](https://github.com/worktile/plait/commit/b172f3530603c8710adfed6a7fa5fc6fe48498e1) Thanks [@WBbug](https://github.com/WBbug)! - support draw abstract and indent polyline

*   [#395](https://github.com/worktile/plait/pull/395) [`3e67224`](https://github.com/worktile/plait/commit/3e67224dc8501903a06229f61acfacb35d4e1810) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add with options plugin

### Patch Changes

-   [`49f50fc`](https://github.com/worktile/plait/commit/49f50fcff2e9695938e4b3d8661b94376d8df47f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add pointer button in constants

## 0.3.0

### Minor Changes

-   [#381](https://github.com/worktile/plait/pull/381) [`281e252`](https://github.com/worktile/plait/commit/281e252622198587fd87218273c525fe18ef8979) Thanks [@WBbug](https://github.com/WBbug)! - add pathRef and pathRefs in PlaitBoard

*   [#384](https://github.com/worktile/plait/pull/384) [`9a015be`](https://github.com/worktile/plait/commit/9a015beea5f00c20a9653fd3f6472410176d034b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support with mind create plugin

### Patch Changes

-   [#375](https://github.com/worktile/plait/pull/375) [`953ffd8`](https://github.com/worktile/plait/commit/953ffd8402ea5ef073891b0e11614a1983455a6e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move getXXXRectangle and isHitXXX to folder of position
    move node-space and layout-options to folder of space
    add testing in core
    add testing in mind

*   [#386](https://github.com/worktile/plait/pull/386) [`a6e9391`](https://github.com/worktile/plait/commit/a6e93914186337778ec954c62512cab263890b3b) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - bump peerDependencies angular version to 15.x

## 0.2.4

### Patch Changes

-   [`d163348`](https://github.com/worktile/plait/commit/d1633480993a7a0d7142071b13e1fbba5f90a750) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - emit change event in ngZone run

## 0.2.3

### Patch Changes

-   [`0793898`](https://github.com/worktile/plait/commit/07938988d484ab42d56393292076e952870c240f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - use CommonModule instead of BrowserModule

## 0.2.2

### Patch Changes

-   [#371](https://github.com/worktile/plait/pull/371) [`3f81f9e`](https://github.com/worktile/plait/commit/3f81f9e3bc16e8465994011e7fd4c18493279298) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - use CommonModule instead of BrowserModule

## 0.2.1

### Patch Changes

-   [`2f6d340`](https://github.com/worktile/plait/commit/2f6d34091f53fcee298e77ace9c3996e9a326db2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent key down handle when target has input or textarea target

*   [`c5f4abd`](https://github.com/worktile/plait/commit/c5f4abd3ad0c98706e4128a86d360d7b65a4939e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct the draw order of root elements

## 0.2.0

### Minor Changes

-   [#321](https://github.com/worktile/plait/pull/321) [`fe2bbb6`](https://github.com/worktile/plait/commit/fe2bbb60e0a452f98383a81eff0fb77a32f7ddc7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor plait core plugin element component structure

*   [`304f2b9`](https://github.com/worktile/plait/commit/304f2b9a613266e5f73b4d3b3403f6ad7aa1b9a2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename package name to mind

### Patch Changes

-   [#337](https://github.com/worktile/plait/pull/337) [`844d3c4`](https://github.com/worktile/plait/commit/844d3c42023ef8b5c37225e57298eb43b062ae6c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support mind node emoji label

*   [#365](https://github.com/worktile/plait/pull/365) [`4aa6168`](https://github.com/worktile/plait/commit/4aa61680ba61ba592017a06583060a83f869dd53) Thanks [@WBbug](https://github.com/WBbug)! - add updateAbstractInDnd function

-   [`e4a8029`](https://github.com/worktile/plait/commit/e4a8029552c64f1d60fa4ae7c8e3f80c9a528eb7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support mind options

*   [`da64e36`](https://github.com/worktile/plait/commit/da64e36cda13300ea6c30535dfdb4a6525f70482) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename isIntersect to isHit and fix isHit float calculate error

-   [`773cbfa`](https://github.com/worktile/plait/commit/773cbfa17b13dda5365d493ef99ddd316bda033e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix last method can not get correctly node when children is empty array

*   [`46719b3`](https://github.com/worktile/plait/commit/46719b3f20982a97cbca9b056ffcb8aeb4d95ec7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add base drawer and implement quick insert drawer

-   [`6580ea0`](https://github.com/worktile/plait/commit/6580ea08c93f67ecca69594964abf6dd632da0ce) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename mindmap to mind

*   [#335](https://github.com/worktile/plait/pull/335) [`3c02181`](https://github.com/worktile/plait/commit/3c021816eefeb53fb003d6f87b7effd515d994c3) Thanks [@WBbug](https://github.com/WBbug)! - add drawAbstractIncludedOutline

-   [`ba40d29`](https://github.com/worktile/plait/commit/ba40d298c0abe636024795cf510ee92ca1c35d68) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - mind node dnd support draw emojis

*   [#352](https://github.com/worktile/plait/pull/352) [`b59ad23`](https://github.com/worktile/plait/commit/b59ad23076254137eeb5fccb99587a385a5d6bcb) Thanks [@WBbug](https://github.com/WBbug)! - update abstract outline when mouseMove

-   [`1eda932`](https://github.com/worktile/plait/commit/1eda932df73dbc2ab266abc9c19fb01ac9e60295) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add throttle handle for with-selection move

*   [#331](https://github.com/worktile/plait/pull/331) [`b549696`](https://github.com/worktile/plait/commit/b549696e506d7b991bbe0cfe52c5ddc153323d8e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct insertG logic

-   [`ff1b1f0`](https://github.com/worktile/plait/commit/ff1b1f0d7d59fc4bc62df0e853eaa61a7aca6f8f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor node equality judge logic
    remove findParentElement function (replace by MindElement.findParent)
    rename filterChildElement to getFirstLevelElement

*   [#369](https://github.com/worktile/plait/pull/369) [`09bbe7a`](https://github.com/worktile/plait/commit/09bbe7ad6f8b9de4bd042031698392a1192d4f76) Thanks [@WBbug](https://github.com/WBbug)! - fix insertG error

-   [#314](https://github.com/worktile/plait/pull/314) [`67fa76c`](https://github.com/worktile/plait/commit/67fa76c1070609adec4c5c06262f0828ddaa6867) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support create edge

## 0.2.0-next.11

### Patch Changes

-   [`ba40d29`](https://github.com/worktile/plait/commit/ba40d298c0abe636024795cf510ee92ca1c35d68) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - mind node dnd support draw emojis

*   [`ff1b1f0`](https://github.com/worktile/plait/commit/ff1b1f0d7d59fc4bc62df0e853eaa61a7aca6f8f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor node equality judge logic
    remove findParentElement function (replace by MindElement.findParent)
    rename filterChildElement to getFirstLevelElement

-   [#369](https://github.com/worktile/plait/pull/369) [`09bbe7a`](https://github.com/worktile/plait/commit/09bbe7ad6f8b9de4bd042031698392a1192d4f76) Thanks [@WBbug](https://github.com/WBbug)! - fix insertG error

## 0.2.0-next.9

### Patch Changes

-   [#365](https://github.com/worktile/plait/pull/365) [`4aa6168`](https://github.com/worktile/plait/commit/4aa61680ba61ba592017a06583060a83f869dd53) Thanks [@WBbug](https://github.com/WBbug)! - add updateAbstractInDnd function

*   [`1eda932`](https://github.com/worktile/plait/commit/1eda932df73dbc2ab266abc9c19fb01ac9e60295) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add throttle handle for with-selection move

## 0.2.0-next.8

### Patch Changes

-   [`e4a8029`](https://github.com/worktile/plait/commit/e4a8029552c64f1d60fa4ae7c8e3f80c9a528eb7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support mind options

## 0.2.0-next.3

### Patch Changes

-   [`6580ea0`](https://github.com/worktile/plait/commit/6580ea08c93f67ecca69594964abf6dd632da0ce) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename mindmap to mind

*   [#352](https://github.com/worktile/plait/pull/352) [`b59ad23`](https://github.com/worktile/plait/commit/b59ad23076254137eeb5fccb99587a385a5d6bcb) Thanks [@WBbug](https://github.com/WBbug)! - update abstract outline when mouseMove

## 0.2.0-next.2

### Patch Changes

-   [`da64e36`](https://github.com/worktile/plait/commit/da64e36cda13300ea6c30535dfdb4a6525f70482) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename isIntersect to isHit and fix isHit float calculate error

*   [`773cbfa`](https://github.com/worktile/plait/commit/773cbfa17b13dda5365d493ef99ddd316bda033e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix last method can not get correctly node when children is empty array

-   [`46719b3`](https://github.com/worktile/plait/commit/46719b3f20982a97cbca9b056ffcb8aeb4d95ec7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add base drawer and implement quick insert drawer

## 0.2.0-next.0

### Minor Changes

-   [#321](https://github.com/worktile/plait/pull/321) [`fe2bbb6`](https://github.com/worktile/plait/commit/fe2bbb60e0a452f98383a81eff0fb77a32f7ddc7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor plait core plugin element component structure

*   [`304f2b9`](https://github.com/worktile/plait/commit/304f2b9a613266e5f73b4d3b3403f6ad7aa1b9a2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename package name to mind

### Patch Changes

-   [#337](https://github.com/worktile/plait/pull/337) [`844d3c4`](https://github.com/worktile/plait/commit/844d3c42023ef8b5c37225e57298eb43b062ae6c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support mind node emoji label

*   [#335](https://github.com/worktile/plait/pull/335) [`3c02181`](https://github.com/worktile/plait/commit/3c021816eefeb53fb003d6f87b7effd515d994c3) Thanks [@WBbug](https://github.com/WBbug)! - add drawAbstractIncludedOutline

-   [#331](https://github.com/worktile/plait/pull/331) [`b549696`](https://github.com/worktile/plait/commit/b549696e506d7b991bbe0cfe52c5ddc153323d8e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct insertG logic

*   [#314](https://github.com/worktile/plait/pull/314) [`67fa76c`](https://github.com/worktile/plait/commit/67fa76c1070609adec4c5c06262f0828ddaa6867) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support create edge

## 0.1.9

### Patch Changes

-   [#302](https://github.com/worktile/plait/pull/302) [`735c007`](https://github.com/worktile/plait/commit/735c007b8f0935ccd895d0360edb290339d30841) Thanks [@WBbug](https://github.com/WBbug)! - change logic of after delete selected elements, fix trackBy

*   [`5ab5a70`](https://github.com/worktile/plait/commit/5ab5a70673199bebf68b6a722dbfce5860a6bde6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct with-hand hand with-viewport can not fire viewport update issues

-   [#303](https://github.com/worktile/plait/pull/303) [`776fd04`](https://github.com/worktile/plait/commit/776fd0403ed7b7f019cc5e4958ac9ce64ce5b9a8) Thanks [@WBbug](https://github.com/WBbug)! - fix can select when board is readonly

*   [`da1f3e2`](https://github.com/worktile/plait/commit/da1f3e2c2a28050f79f464fc62cd8b7ede9cca0a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct richtext style and add get richtext content size func

-   [#304](https://github.com/worktile/plait/pull/304) [`fc62414`](https://github.com/worktile/plait/commit/fc62414d0c54757f198b1311798296f6bfec492f) Thanks [@Maple13](https://github.com/Maple13)! - fix the calculation error caused by the influence of hideScrollbar property

## 0.1.8

### Patch Changes

-   [#298](https://github.com/worktile/plait/pull/298) [`5a9841f`](https://github.com/worktile/plait/commit/5a9841f441adaeaca3e188b6c5a44e442a6ea476) Thanks [@Maple13](https://github.com/Maple13)! - when fitting to the canvas, the spacing is modified to 20px

*   [`c464232`](https://github.com/worktile/plait/commit/c46423284f4d4536dcbd19e67b5bdae88367b6a1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - use debounce func with leading when update viewport in onChange hook

-   [#300](https://github.com/worktile/plait/pull/300) [`d879c8b`](https://github.com/worktile/plait/commit/d879c8b675b0ee711a7cddc41b23fea939674812) Thanks [@Maple13](https://github.com/Maple13)! - when fitting to the canvas, the spacing is modified to 16

*   [`f897b3d`](https://github.com/worktile/plait/commit/f897b3de35c371d2166e99d7785abdbbd1191721) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - wait node destroy and remove selected element state

## 0.1.7

### Patch Changes

-   [`5d45fe0`](https://github.com/worktile/plait/commit/5d45fe0892d0972f7af812aa8fadb18659c37af0) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - set correctly origination when container scrolled

## 0.1.6

### Patch Changes

-   [#296](https://github.com/worktile/plait/pull/296) [`fa37ef5`](https://github.com/worktile/plait/commit/fa37ef5f2b113edb3f3b889b2e81778f0c8d1f09) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - redraw selectionOuterG at moving end

*   [`6dccf68`](https://github.com/worktile/plait/commit/6dccf68276fba72ba656d577c5b93626a224d937) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add IS_FROM_SCROLLING and IS_FROM_VIEWPORT_CHANGE to prevent viewport and scroll call circle

-   [#295](https://github.com/worktile/plait/pull/295) [`84f21a4`](https://github.com/worktile/plait/commit/84f21a40938b59a6bb99952fe754ead34c42aa39) Thanks [@WBbug](https://github.com/WBbug)! - change outerG position and primary color

## 0.1.5

### Patch Changes

-   [#289](https://github.com/worktile/plait/pull/289) [`b451983`](https://github.com/worktile/plait/commit/b451983b55b653cff2f708aaaf63424afe552a25) Thanks [@WBbug](https://github.com/WBbug)! - add withMoving

*   [#286](https://github.com/worktile/plait/pull/286) [`d526031`](https://github.com/worktile/plait/commit/d5260317eb11ed0f9fb9101cd11eb2060883a4b3) Thanks [@WBbug](https://github.com/WBbug)! - change isIntersectionSelection to isHitSelection

-   [#292](https://github.com/worktile/plait/pull/292) [`5b79308`](https://github.com/worktile/plait/commit/5b7930884b2acb99a6fa2d7b0495edfac1a9300b) Thanks [@WBbug](https://github.com/WBbug)! - prevent move when text is editing

*   [#287](https://github.com/worktile/plait/pull/287) [`be85200`](https://github.com/worktile/plait/commit/be852000408d8fe8b14448643290019eacd47dda) Thanks [@Maple13](https://github.com/Maple13)! - handle scroll bar width impact in fitViewport

## 0.1.4

### Patch Changes

-   [`32c1276`](https://github.com/worktile/plait/commit/32c12769e8d43b03bfe91cf1a36691b0772ba419) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct isAttachedElement value in with selection

## 0.1.3

### Patch Changes

-   [`4401da6`](https://github.com/worktile/plait/commit/4401da6a2a019d8c7078387eee6529a240b2e887) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct richtext position and size style

*   [#285](https://github.com/worktile/plait/pull/285) [`717cd1c`](https://github.com/worktile/plait/commit/717cd1c1eea7d0dafb15fe6ec0889cadc3c13dca) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct viewport update flow

-   [#284](https://github.com/worktile/plait/pull/284) [`0c01a0e`](https://github.com/worktile/plait/commit/0c01a0ef802f3172eaca1cfc5987ff459ef1905b) Thanks [@Maple13](https://github.com/Maple13)! - optimize resize processing

*   [#282](https://github.com/worktile/plait/pull/282) [`26d11a5`](https://github.com/worktile/plait/commit/26d11a5b1d3d7714aa36bc8e232ac78119270ea1) Thanks [@WBbug](https://github.com/WBbug)! - fix import error

## 0.1.2

### Patch Changes

-   [#279](https://github.com/worktile/plait/pull/279) [`d7f7fe5`](https://github.com/worktile/plait/commit/d7f7fe50fea4b97250eba4d5e2b782ac642030e6) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - set selection when end of moving

*   [#275](https://github.com/worktile/plait/pull/275) [`b05d582`](https://github.com/worktile/plait/commit/b05d5828ecb944ea9f1e0fa472eb996671f33bcb) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - cancel move when point is outside of plaitBoard

-   [`e4c3278`](https://github.com/worktile/plait/commit/e4c327814f87d2df64c49b20b6128d60609911bd) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support clear board selection

*   [`fd63afd`](https://github.com/worktile/plait/commit/fd63afd0cef0970becd475d5985b44abf2104927) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add global selection moving state

-   [#276](https://github.com/worktile/plait/pull/276) [`d6565c2`](https://github.com/worktile/plait/commit/d6565c2ae9d67296a95539e08e5e13d933f3826d) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix move event trigger error

*   [#278](https://github.com/worktile/plait/pull/278) [`8e1a45a`](https://github.com/worktile/plait/commit/8e1a45a9c8962409ab59d66ca9fcea95d666948a) Thanks [@WBbug](https://github.com/WBbug)! - change min value

-   [#273](https://github.com/worktile/plait/pull/273) [`2e894d5`](https://github.com/worktile/plait/commit/2e894d5ee5ada069ca5c6ccfd968a0665a0e1422) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add withMove plugin

*   [#274](https://github.com/worktile/plait/pull/274) [`7ca6fa3`](https://github.com/worktile/plait/commit/7ca6fa32f080645ff907f392eb8bc6139b8d7b67) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add BOARD_TO_MOVING_ELEMENT and redraw edges when node change

-   [#263](https://github.com/worktile/plait/pull/263) [`16acd6b`](https://github.com/worktile/plait/commit/16acd6bb2fbcc06d07c6370c80dd5ab08603a88c) Thanks [@Maple13](https://github.com/Maple13)! - refactored rolling scheme calculation logic

## 0.1.1

### Patch Changes

-   [#272](https://github.com/worktile/plait/pull/272) [`3364882`](https://github.com/worktile/plait/commit/336488248c70839177ac3a93a54369969024667e) Thanks [@WBbug](https://github.com/WBbug)! - set selection when copy

*   [#272](https://github.com/worktile/plait/pull/272) [`19c2e15`](https://github.com/worktile/plait/commit/19c2e154b4a85ded3289dadd40a5d5698c83e394) Thanks [@WBbug](https://github.com/WBbug)! - add set selection with temporary elements

-   [#271](https://github.com/worktile/plait/pull/271) [`8dda5c6`](https://github.com/worktile/plait/commit/8dda5c6a49c9ff2c5093fe31d63838c79ee95112) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix can not select node

## 0.1.0

### Minor Changes

-   [`42708c2`](https://github.com/worktile/plait/commit/42708c2880be02ed30280d75fc21bb3f143c7537) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Release v0.1.0 to welcome new members @plait/flow 🎉 🎉 🎉 !

### Patch Changes

-   [#256](https://github.com/worktile/plait/pull/256) [`ed51de2`](https://github.com/worktile/plait/commit/ed51de2682322e703d14d20b2ed3e7b6ca92a917) Thanks [@Ashy6](https://github.com/Ashy6)! - Handle box selection boundary case and right mouse button

*   [#235](https://github.com/worktile/plait/pull/235) [`e0be632`](https://github.com/worktile/plait/commit/e0be632e0fd4f4bb47d2a2f75ca2fe2c69653ec2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add element host

-   [#241](https://github.com/worktile/plait/pull/241) [`8719a47`](https://github.com/worktile/plait/commit/8719a473310f9201e89c6ba131d6458e41884f74) Thanks [@WBbug](https://github.com/WBbug)! - add copy create mindmap, add getRectangleByNodes

*   [#268](https://github.com/worktile/plait/pull/268) [`0336a2a`](https://github.com/worktile/plait/commit/0336a2a3f0e614cddd412b7a8a49792a727400ea) Thanks [@WBbug](https://github.com/WBbug)! - change selection type, add range type

-   [`e6db0bb`](https://github.com/worktile/plait/commit/e6db0bbde464f0f9415f885287e80c99bd11a643) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix save host error in BOARD_TO_HOST

*   [#261](https://github.com/worktile/plait/pull/261) [`6dae534`](https://github.com/worktile/plait/commit/6dae5346338cb6f4ac0793c0f4db1d1027dbd3e2) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - draw outer selection rectangle

-   [#267](https://github.com/worktile/plait/pull/267) [`c843502`](https://github.com/worktile/plait/commit/c84350267f6e593011f83874ec87961da72961a1) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - set selection when mousedown and mousemove

*   [#255](https://github.com/worktile/plait/pull/255) [`4bd2bb9`](https://github.com/worktile/plait/commit/4bd2bb95e2c860e499bd3c583a58fc4c83954c1c) Thanks [@WBbug](https://github.com/WBbug)! - fix multipule delete, change changeRightNodeCount function, delete allowClearBoard option in core

-   [#258](https://github.com/worktile/plait/pull/258) [`d400f04`](https://github.com/worktile/plait/commit/d400f046487eecc28d6b9ca9a0d5eae10cadcdf7) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - implement getRectangle function

*   [#252](https://github.com/worktile/plait/pull/252) [`968c2f1`](https://github.com/worktile/plait/commit/968c2f152080bc30b69153dca97c9a75840d9862) Thanks [@Ashy6](https://github.com/Ashy6)! - draw moving selection g

-   [#257](https://github.com/worktile/plait/pull/257) [`69ac1ed`](https://github.com/worktile/plait/commit/69ac1ed06ee2c227b6f52dac940ff97a179873bb) Thanks [@Maple13](https://github.com/Maple13)! - rename viewportScrollListener and elementResizeListener

*   [#259](https://github.com/worktile/plait/pull/259) [`9d217b1`](https://github.com/worktile/plait/commit/9d217b1cdf2afb5f2a34d217ef26cc4892154d60) Thanks [@Ashy6](https://github.com/Ashy6)! - extend style processing when the box is selected

-   [#253](https://github.com/worktile/plait/pull/253) [`0a0fb38`](https://github.com/worktile/plait/commit/0a0fb381fb63e81716c2a824bd90e1988b0a5771) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add get rectangle hook

*   [#262](https://github.com/worktile/plait/pull/262) [`8b65ff5`](https://github.com/worktile/plait/commit/8b65ff5b9804e089381f3932420f56e41dab743a) Thanks [@Ashy6](https://github.com/Ashy6)! - refactor with-hand to viewport-moving state

## 0.0.58

### Patch Changes

-   [#232](https://github.com/worktile/plait/pull/232) [`33beb32`](https://github.com/worktile/plait/commit/33beb326070c0d66d544037d110e6b6773ef7fa2) Thanks [@Maple13](https://github.com/Maple13)! - optimize parameter usage

*   [`6888f93`](https://github.com/worktile/plait/commit/6888f93633a88f7677deab6c8fa90f09585e9cff) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - export BoardTransforms

## 0.0.57

### Patch Changes

-   [`f4d5b3b`](https://github.com/worktile/plait/commit/f4d5b3b42f6273a8324674278096402e2dc41f1d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename cursor to pointer

*   [`2af223f`](https://github.com/worktile/plait/commit/2af223fa6f55b0062da255dd752ae1de236d43a8) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - extract plugin-element-component as base classs, add global ELEMENT_TO_COMPONENT

-   [#226](https://github.com/worktile/plait/pull/226) [`000192c`](https://github.com/worktile/plait/commit/000192cc5eee3a81e58f59c2c43e494b6b0dd81a) Thanks [@Maple13](https://github.com/Maple13)! - refactor viewport

*   [`cbbe631`](https://github.com/worktile/plait/commit/cbbe631ee4818dd83ede05127554ce8d679e4211) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add update updatePointerType func and add BoardComponentInterface

-   [`03804a0`](https://github.com/worktile/plait/commit/03804a0c4dd52d9918a2b73c814385edc6e4d447) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - resolve the issue that onChange event is fired unexpectedly

## 0.0.56

### Patch Changes

-   [#218](https://github.com/worktile/plait/pull/218) [`e01a9a4`](https://github.com/worktile/plait/commit/e01a9a433316cc811685550ecb938ccbf53220d3) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - correctly move operation and move reverse logic

## 0.0.55

### Patch Changes

-   [#212](https://github.com/worktile/plait/pull/212) [`e587b9c`](https://github.com/worktile/plait/commit/e587b9cd87ef701adb3350155dbcceb70100854c) Thanks [@Maple13](https://github.com/Maple13)! - calculate slip based on matrix

## 0.0.53

### Patch Changes

-   [#207](https://github.com/worktile/plait/pull/207) [`3cddec3`](https://github.com/worktile/plait/commit/3cddec3a6e767f893bbdbd7e7703c4f14199b714) Thanks [@Maple13](https://github.com/Maple13)! - disable artboard swipe when not in focus

## 0.0.52

### Patch Changes

-   [#200](https://github.com/worktile/plait/pull/200) [`d454f54`](https://github.com/worktile/plait/commit/d454f543eb1dc3e2782df2021bf2d721c2713f98) Thanks [@Ashy6](https://github.com/Ashy6)! - set min zoom 0.2

*   [#201](https://github.com/worktile/plait/pull/201) [`e8f61cb`](https://github.com/worktile/plait/commit/e8f61cb65f10b574e0d5783b1abae179297865a6) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix: fix scrollbar can not display

-   [#202](https://github.com/worktile/plait/pull/202) [`7fb3f90`](https://github.com/worktile/plait/commit/7fb3f904a2a453b92ce69fcf177a5dc61aafd2d4) Thanks [@Maple13](https://github.com/Maple13)! - fixed the problem of node occlusion and jumping when adding new nodes

## 0.0.50

### Patch Changes

-   [#195](https://github.com/worktile/plait/pull/195) [`0ae6eaa`](https://github.com/worktile/plait/commit/0ae6eaa7c48e6e8f1f2e9a86e3ad583d95654b0b) Thanks [@Ashy6](https://github.com/Ashy6)! - course add drag status

*   [#196](https://github.com/worktile/plait/pull/196) [`e62a8e9`](https://github.com/worktile/plait/commit/e62a8e9ebb3bdf3486f5c0b8352dfbb9f0f4bb71) Thanks [@Maple13](https://github.com/Maple13)! - calculate position using matrix, fix node edit state error

## 0.0.49

### Patch Changes

-   [#188](https://github.com/worktile/plait/pull/188) [`1b500f7`](https://github.com/worktile/plait/commit/1b500f72121f76e1e27594200a708a65f3188cc7) Thanks [@Maple13](https://github.com/Maple13)! - modify transforms naming error, remove useless zoom calculation

*   [#189](https://github.com/worktile/plait/pull/189) [`f5de848`](https://github.com/worktile/plait/commit/f5de8489519e24d8418a88554b76f09819772b8f) Thanks [@Ashy6](https://github.com/Ashy6)! - fix caled percentage display

-   [#187](https://github.com/worktile/plait/pull/187) [`ae90e72`](https://github.com/worktile/plait/commit/ae90e72bb661cf609807ae52db1311efdd999239) Thanks [@Ashy6](https://github.com/Ashy6)! - new node element always in canvas

## 0.0.48

### Patch Changes

-   [#182](https://github.com/worktile/plait/pull/182) [`0d3c9a9`](https://github.com/worktile/plait/commit/0d3c9a9db946c9a2fb094d5559a5561a22875c62) Thanks [@Ashy6](https://github.com/Ashy6)! - fix drag and drop moving canvas

## 0.0.47

### Patch Changes

-   [#165](https://github.com/worktile/plait/pull/165) [`a4a54ce`](https://github.com/worktile/plait/commit/a4a54ce81bd8792ccb093a0cd4255c9c331ba531) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - limit the scroll area

*   [#175](https://github.com/worktile/plait/pull/175) [`00fdc81`](https://github.com/worktile/plait/commit/00fdc814914a7a1051320c3368e61b468e04fa05) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - refactor: change MindQueries export

## 0.0.46

### Patch Changes

-   [#174](https://github.com/worktile/plait/pull/174) [`c556abf`](https://github.com/worktile/plait/commit/c556abf84536eaf961740f465b047913a222af04) Thanks [@Ashy6](https://github.com/Ashy6)! - fix adaptHandel zoom change when default equal 1.0

## 0.0.45

### Patch Changes

-   [#167](https://github.com/worktile/plait/pull/167) [`19f250a`](https://github.com/worktile/plait/commit/19f250a3fbe3a6ad01096f6d23d830f048ffed55) Thanks [@Maple13](https://github.com/Maple13)! - synchronize options on Changes

*   [#167](https://github.com/worktile/plait/pull/167) [`19f250a`](https://github.com/worktile/plait/commit/19f250a3fbe3a6ad01096f6d23d830f048ffed55) Thanks [@Maple13](https://github.com/Maple13)! - fix scrollbar width calculation error

## 0.0.44

### Patch Changes

-   [#162](https://github.com/worktile/plait/pull/162) [`653b8d4`](https://github.com/worktile/plait/commit/653b8d422aad64ec27baa8d134e055bd626f43fe) Thanks [@Maple13](https://github.com/Maple13)! - board adds the fullscreen property, use fullscreen to control whether the width and height of the canvas include the scroll bar distance

*   [#164](https://github.com/worktile/plait/pull/164) [`ed5cc33`](https://github.com/worktile/plait/commit/ed5cc3395d6a5457f81f5b818395bc07da5a38f4) Thanks [@Maple13](https://github.com/Maple13)! - disable scrolling when board is not focused

-   [#162](https://github.com/worktile/plait/pull/162) [`653b8d4`](https://github.com/worktile/plait/commit/653b8d422aad64ec27baa8d134e055bd626f43fe) Thanks [@Maple13](https://github.com/Maple13)! - integrate board options parameters

## 0.0.43

### Patch Changes

-   [#155](https://github.com/worktile/plait/pull/155) [`0f5cde0`](https://github.com/worktile/plait/commit/0f5cde0be6a51a1faf67480e7805ac450b02c548) Thanks [@Maple13](https://github.com/Maple13)! - limit the scroll area

## 0.0.42

### Patch Changes

-   [#149](https://github.com/worktile/plait/pull/149) [`fab99b0`](https://github.com/worktile/plait/commit/fab99b0aa9732a13abc0450afc53ab5aeb7689da) Thanks [@Ashy6](https://github.com/Ashy6)! - modify the way changes are detected

*   [#146](https://github.com/worktile/plait/pull/146) [`472c0b4`](https://github.com/worktile/plait/commit/472c0b46e95c36025731dde7fb66970917b3fa44) Thanks [@Ashy6](https://github.com/Ashy6)! - fix: stop cursor grabbing when Space up

## 0.0.41

### Patch Changes

-   [#138](https://github.com/worktile/plait/pull/138) [`b9bebb`](https://github.com/worktile/plait/commit/b9bebb4c4642c4141c3349131a94810ca65130e1) Thanks [@Ashy6](https://github.com/Ashy6)! - refactor(core): use withMove plugin #WIK-8741

## 0.0.40

### Patch Changes

-   [#133](https://github.com/worktile/plait/pull/133) [`bebfdc5`](https://github.com/worktile/plait/commit/bebfdc5728b013b1a2f1de5653f18f4e9cb2d64e) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix(core): revert keydown code

-   [`9e31d7c`](https://github.com/worktile/plait/commit/9e31d7c81d01300083c1361805bb5b634c36d126) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support rerender when value change

## 0.0.39

### Patch Changes

-   [#122](https://github.com/worktile/plait/pull/122) [`64e428d`](https://github.com/worktile/plait/commit/64e428d77a655891744efc043824875410babd57) Thanks [@Ashy6](https://github.com/Ashy6)! - moveMode and drop to disable node

## 0.0.38

### Patch Changes

-   [#113](https://github.com/worktile/plait/pull/113) [`f45dfea`](https://github.com/worktile/plait/commit/f45dfead327d4863ccb27efd768676aee95576ab) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix: add updateCursorStatus func

*   [#111](https://github.com/worktile/plait/pull/111) [`746ef40`](https://github.com/worktile/plait/commit/746ef408af726127d9bb021a36704aad2caa4145) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix: fix the error of undo after dragging

## 0.0.37

### Patch Changes

-   [#99](https://github.com/worktile/plait/pull/99) [`9596e78`](https://github.com/worktile/plait/commit/9596e789effddb671f4dbfa8da51bc90879d2994) Thanks [@Ashy6](https://github.com/Ashy6)! - support drag and drop mode for plait-board

## 0.0.35

### Patch Changes

-   [#84](https://github.com/worktile/plait/pull/84) [`65e9d11`](https://github.com/worktile/plait/commit/65e9d11cc098e2898d201f3f571a579c8234c618) Thanks [@Ashy6](https://github.com/Ashy6)! - add toolbar for board

*   [#84](https://github.com/worktile/plait/pull/84) [`65e9d11`](https://github.com/worktile/plait/commit/65e9d11cc098e2898d201f3f571a579c8234c618) Thanks [@Ashy6](https://github.com/Ashy6)! - 1. change plait toolbar style
    2. support adapt of board
    3. fix zoomIn and zoomOut

## 0.0.33

### Patch Changes

-   [`cb662d5`](https://github.com/worktile/plait/commit/cb662d5e0639a5312b3c7b9d7212debad5450ebf) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - [with-selection]: remove set start logic on mouseup

## 0.0.29

### Patch Changes

-   [`6b699e8`](https://github.com/worktile/plait/commit/6b699e82c37a7bd8a2d0560d0f1da4c7e11b9422) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add distanceBetweenPointAndPoint

## 0.0.28

### Patch Changes

-   [`a22fa0e`](https://github.com/worktile/plait/commit/a22fa0e20aa40ccb4ba1636efff1dc87019b5d75) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - undos skip set_viewport

*   [#74](https://github.com/worktile/plait/pull/74) [`0ac6fbf`](https://github.com/worktile/plait/commit/0ac6fbf482414af728c0069d589e113eb1f79645) Thanks [@Maple13](https://github.com/Maple13)! - add focused class when board gets focus

## 0.0.25

### Patch Changes

-   [`094a3c0`](https://github.com/worktile/plait/commit/094a3c07507598dd91cb53197aa87bfd6b8f5c62) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - listener document copy/cut/paste replace host

## 0.0.24

### Patch Changes

-   [#63](https://github.com/worktile/plait/pull/63) [`83575fd`](https://github.com/worktile/plait/commit/83575fd9cb370025fa13578474443d5600569faa) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - mindmap support paste text

*   [#67](https://github.com/worktile/plait/pull/67) [`d427227`](https://github.com/worktile/plait/commit/d427227f7fd151b6d2a38bd853a1f4a787f81e8c) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - implement mindmap cut function

## 0.0.22

### Patch Changes

-   [#56](https://github.com/worktile/plait/pull/56) [`3fe5f0d`](https://github.com/worktile/plait/commit/3fe5f0de1d2224f042fcbdada4b1b54b80bd471d) Thanks [@Maple13](https://github.com/Maple13)! - feat: add plait/core override function

## 0.0.21

### Patch Changes

-   [#51](https://github.com/worktile/plait/pull/51) [`34259f9`](https://github.com/worktile/plait/commit/34259f952132cfdbc179ab96314bf9565b611a60) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix set_viewport merge error

## 0.0.19

### Patch Changes

-   [`dc0a5dd`](https://github.com/worktile/plait/commit/dc0a5dd4016abf1ed339c414d2d9b8c6b3491b5d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - mouseup rename globalMouseup and complete withSelection

*   [#41](https://github.com/worktile/plait/pull/41) [`b48a91e`](https://github.com/worktile/plait/commit/b48a91e207aa8624ab5c1475612d84101a75042d) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - sync richtext when mandmap node change and merge width change operation

## 0.0.17

### Patch Changes

-   [`68cd7a1`](https://github.com/worktile/plait/commit/68cd7a16a0db558c6faf4dea57fc8041bc421b8d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix isHotkey import error

## 0.0.16

### Patch Changes

-   [#36](https://github.com/worktile/plait/pull/36) [`5d08a51`](https://github.com/worktile/plait/commit/5d08a51e22f08fa03b2c43b6242bd621397fa8f7) Thanks [@WBbug](https://github.com/WBbug)! - add refreshViewport function

*   [#37](https://github.com/worktile/plait/pull/37) [`ec23b28`](https://github.com/worktile/plait/commit/ec23b285af91217569a682b41b06468863cd3c92) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support undo and redo

## 0.0.14

### Patch Changes

-   [#33](https://github.com/worktile/plait/pull/33) [`bc533d0`](https://github.com/worktile/plait/commit/bc533d059a4f6b7e5f3674f1a0dc21c444ac8925) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add plaitAllowClearBoard determine whether to allow the board to be cleared

## 0.0.13

### Patch Changes

-   [#29](https://github.com/worktile/plait/pull/29) [`6ee54c6`](https://github.com/worktile/plait/commit/6ee54c6e2061d0013290bb8723b23b9fa36052ad) Thanks [@Ashy6](https://github.com/Ashy6)! - change the view and return the result

## 0.0.12

### Patch Changes

-   [`0065e89`](https://github.com/worktile/plait/commit/0065e8961a7c21f7ff5bceeae2f591099b17184f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support clear selection when mousedown ouside of board

## 0.0.11

### Patch Changes

-   [`c391d88`](https://github.com/worktile/plait/commit/c391d88cd62c619a6e3de269c0445880069a018c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove selection handle when mousedown and use style resolve

## 0.0.8

### Patch Changes

-   [#24](https://github.com/worktile/plait/pull/24) [`2c5ce0e`](https://github.com/worktile/plait/commit/2c5ce0ef862b1f2766fb4bf74b05032267932a00) Thanks [@Maple13](https://github.com/Maple13)! - fix(core): fix misjudgment

## 0.0.7

### Patch Changes

-   [#23](https://github.com/worktile/plait/pull/23) [`9cd6711`](https://github.com/worktile/plait/commit/9cd6711ddb5d8fab0b87e0c81614190fb282329e) Thanks [@Maple13](https://github.com/Maple13)! - feat(core): add filter processing of no selection elements

## 0.0.6

### Patch Changes

-   [#21](https://github.com/worktile/plait/pull/21) [`e5dbb75`](https://github.com/worktile/plait/commit/e5dbb75659dc9d30f3cf7154c4b9735d7fdd2518) Thanks [@Maple13](https://github.com/Maple13)! - feat(board): add focus state and processing

## 0.0.5

### Patch Changes

-   [#18](https://github.com/worktile/plait/pull/18) [`8c85cec`](https://github.com/worktile/plait/commit/8c85cec206736adcc57b9e0ead7cb14fc5ff17fe) Thanks [@Maple13](https://github.com/Maple13)! - feat(board): support readonly properties

*   [`f76a4b1`](https://github.com/worktile/plait/commit/f76a4b15c884e1584bd52a7422d9b6134b3c9f7e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - [core] fix listener keydown/keyUp when board is selection mode

## 0.0.4

### Patch Changes

-   [`c35e105`](https://github.com/worktile/plait/commit/c35e10532e7dd13315e481a28834f180699f34d2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update styles

## 0.0.2

### Patch Changes

-   first release
