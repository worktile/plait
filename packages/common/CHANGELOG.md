# @plait/common

## 0.52.0-next.0

### Minor Changes

-   [`6b6678df`](https://github.com/worktile/plait/commit/6b6678dfd65d9cfe1b80726afdd9ef4044d9202a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - bump angular into v17

### Patch Changes

-   [`c7565c08`](https://github.com/worktile/plait/commit/c7565c08e6d52a91e2df87ac5405bdcd21406cbb) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename getPointByVector to getPointByVectorComponent
    rename getPointByUnitVectorAndDirectionComponent to getPointByVectorDirectionComponent

## 0.51.3

### Patch Changes

-   [#767](https://github.com/worktile/plait/pull/767) [`524cd91e`](https://github.com/worktile/plait/commit/524cd91efc94b8523191fdad95b3579cc4defb03) Thanks [@MissLixf](https://github.com/MissLixf)! - hit select correct with angle
    rectangle hit select correct with angle

## 0.51.2

## 0.51.1

## 0.51.0

### Minor Changes

-   [`72927957`](https://github.com/worktile/plait/commit/729279576c78e16d4016613dba7c58a47c93ed33) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add `getCrossingPointsBetweenPointAndSegment` method in math
    add utils for vector: `getPointByUnitVectorAndDirectionComponent`, `getUnitVectorByPointAndPoint`
    Use the `getCrossingPointsBetweenPointAndSegment` method to get the associated points (intersection points of the axis and the line segment) that can get points and line segments. It can be used differently from `getNearestPointBetweenPointAndSegment`.

*   [#742](https://github.com/worktile/plait/pull/742) [`1c3cfa4d`](https://github.com/worktile/plait/commit/1c3cfa4d35c9d7b1d1c2c553546a81337e89bdfc) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - throttleRAF support set key and board to avoid the effect of multiple scene call

-   [#714](https://github.com/worktile/plait/pull/714) [`541bd50d`](https://github.com/worktile/plait/commit/541bd50dc64477d526ca959635b2ff3ad7494f70) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - elbow-line supports dragging to adjust the inflection point
    extract getSourceAndTargetOuterRectangle to common
    extract isSourceAndTargetIntersect to common
    add isHorizontalSegment to core
    add isVerticalSegment to core
    add isPointsOnSameLine to core
    refactor getElbowPoints when points.length > 2

*   [#709](https://github.com/worktile/plait/pull/709) [`469acbd1`](https://github.com/worktile/plait/commit/469acbd1fc945b1b68497f85d112feecba29d743) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support resize entire draw elements

### Patch Changes

-   [#744](https://github.com/worktile/plait/pull/744) [`712ccb12`](https://github.com/worktile/plait/commit/712ccb12a6113c5b59eb48b022732824ff529044) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - optimize the code for drawing equal lines
    add getDirectionFactorByDirectionComponent

*   [#737](https://github.com/worktile/plait/pull/737) [`91d1685c`](https://github.com/worktile/plait/commit/91d1685c62c4ac4b7717da315e3a32a0838f1174) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - isHorizontalSegment renamed to isOverHorizontal
    isVerticalSegment renamed to isOverVertical
    isPointsOnSameLine renamed to isAlign
    move the three method to Point instance
    move getRectangleByPoints to RectangleClient instance

-   [#719](https://github.com/worktile/plait/pull/719) [`fb5688e9`](https://github.com/worktile/plait/commit/fb5688e927d2ed73b50aa3b5dd52a173d447b0f7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename removeIntermediatePointsInSegment to simplifyOrthogonalPoints and fix it's issue

*   [`de835ae1`](https://github.com/worktile/plait/commit/de835ae19e9bc26fc6d53cb1ff486b0433c3f0e7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add correctly isShift state in common with resize

-   [`66219f5a`](https://github.com/worktile/plait/commit/66219f5a2c98c10da76aeb9e13cf781c90e49288) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Solve the precision issue of floating point number operations
    Extract getCornerPointsByPoints to obtain corner points (avoid obtaining corner point via floating point operations)

*   [#723](https://github.com/worktile/plait/pull/723) [`e78b3bed`](https://github.com/worktile/plait/commit/e78b3bedeee8f1d33483595c2bbb3375369dba80) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - merge same points after line resize

-   [`5a8ba4dd`](https://github.com/worktile/plait/commit/5a8ba4dd1889547d2b9f46a4668a2569aa89dee5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - use simplified orthogonal points to get turn count and remove getCornerCount

*   [`6ebef0fd`](https://github.com/worktile/plait/commit/6ebef0fdc46af7f995f7d52fefa0ada7930ec991) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Correct the abnormal problem of orthogonal data points and ensure that the connection between two points of the orthogonal line must be a horizontal or vertical line segment

-   [`6fc12925`](https://github.com/worktile/plait/commit/6fc129250950de940a73687d4cdeda8d2b88a940) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename isPointOnLineSegment to isPointOnSegment and move to math file
    rename xAxis/yAxis to centerX/centerY
    rename getEdgeOnPolygonByPoint to getPolygonEdgeByConnectionPoint

## 0.50.1

### Patch Changes

-   [#702](https://github.com/worktile/plait/pull/702) [`aff5f597`](https://github.com/worktile/plait/commit/aff5f597156f562962bf42557256ef295d2328e3) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - compat firefox contextmenu copy and fix mind image copy

## 0.50.0

### Patch Changes

-   [#701](https://github.com/worktile/plait/pull/701) [`18790e12`](https://github.com/worktile/plait/commit/18790e1272dffe80366927c19d334837ebc34b51) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add getElementsText

*   [`8178ea40`](https://github.com/worktile/plait/commit/8178ea409a23b27021b28aa9284c942ffe3c65c5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct alignHorizontalCenter and alignVerticalCenter logic

## 0.49.0

### Minor Changes

-   [`d0834d52`](https://github.com/worktile/plait/commit/d0834d5212fcf9c7228b88718f0695721f18d3ef) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - setFontSize support argument defaultFontSize as number and method

*   [`8250c28a`](https://github.com/worktile/plait/commit/8250c28a0580eb06a7a1a297871df263869167fa) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - extract to-point to handle coordinate transform

-   [#696](https://github.com/worktile/plait/pull/696) [`f874b7ec`](https://github.com/worktile/plait/commit/f874b7ecdbca3a21a8467bcfd5e1a7761fb28d08) Thanks [@WBbug](https://github.com/WBbug)! - support distribute

*   [`bfacadde`](https://github.com/worktile/plait/commit/bfacaddefa2b8602741989bd8022538ded67890c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add setLineShape, modify setLineMark to support set multiple line marks

### Patch Changes

-   [#697](https://github.com/worktile/plait/pull/697) [`1651e7e5`](https://github.com/worktile/plait/commit/1651e7e58e4801e3e05d81f0649d8f5969daaf85) Thanks [@Maple13](https://github.com/Maple13)! - setTextAlign deletes useless parameters

## 0.48.0

### Minor Changes

-   [#695](https://github.com/worktile/plait/pull/695) [`cb3d1320`](https://github.com/worktile/plait/commit/cb3d132042768739e1ed30a4bef4ac962877778f) Thanks [@WBbug](https://github.com/WBbug)! - support shape align

## 0.47.0

### Minor Changes

-   [`85562abc`](https://github.com/worktile/plait/commit/85562abc2af58991c1ce50a2e140a4f72ef02942) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - skip 0.46.0

## 0.46.0

### Minor Changes

-   [`4cb6e2d8`](https://github.com/worktile/plait/commit/4cb6e2d8358f9f4a671b897289c11b4286b1b0fe) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct with-resize plugin distance error
    use keyDown record isShift

### Patch Changes

-   [`7aee1f95`](https://github.com/worktile/plait/commit/7aee1f9598199840d00aaac3d96b20d2ac5fb192) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support prepend option in GeneratorOptions, and set prepend to true in node shape generator

## 0.45.0

### Minor Changes

-   [`1f7f90a5`](https://github.com/worktile/plait/commit/1f7f90a52eb5f9a2bf550b10f1af3a2efee2ec76) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getFirstTextManage and getFirstTextEditor, remove get textManage and getEditor in mind element and geometry element

*   [#691](https://github.com/worktile/plait/pull/691) [`6f7d869c`](https://github.com/worktile/plait/commit/6f7d869c8e5343825c20547a0f90f2bfa6b1e236) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move set_selection to pointerUp

## 0.44.0

### Minor Changes

-   [`81549415`](https://github.com/worktile/plait/commit/81549415f5239f80fdfe4a9bf321b364cb9dc536) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getTextMarksByElement in common

## 0.43.0

## 0.42.0

## 0.41.0

## 0.40.0

### Minor Changes

-   [`025bd41b`](https://github.com/worktile/plait/commit/025bd41b8ef3656fb1ff19f008cf01760914294b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor mind node resize, use basic with resize in common

*   [`e90c5c21`](https://github.com/worktile/plait/commit/e90c5c2192807eae2b6d6d7c230bc4e979d4c863) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct getGapCenter method logic, add note for a-star
    improve line route demo and

## 0.39.0

### Minor Changes

-   [`825dd399`](https://github.com/worktile/plait/commit/825dd39910458fba99298ca6c3df8fa74ff45762) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support shift select element

*   [#673](https://github.com/worktile/plait/pull/673) [`2fa35217`](https://github.com/worktile/plait/commit/2fa352177f64844041654b4f47a21bfb2d445ee2) Thanks [@WBbug](https://github.com/WBbug)! - support match

## 0.38.0

## 0.37.0

### Minor Changes

-   [#666](https://github.com/worktile/plait/pull/666) [`74e1b85a`](https://github.com/worktile/plait/commit/74e1b85a91ba4edce8218e34b89ad03e58f4227d) Thanks [@WBbug](https://github.com/WBbug)! - get common transform

## 0.36.0

### Minor Changes

-   [#663](https://github.com/worktile/plait/pull/663) [`5db82bd0`](https://github.com/worktile/plait/commit/5db82bd0c196b3311d742a2ffb9c92800468f359) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move cursor class enum to core
    improve line auto complete reaction

*   [`3f6816ff`](https://github.com/worktile/plait/commit/3f6816ff5540a69a9b4e5c6ac8589b108d3656b5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - should prevent pointerDown when resizeDetectResult exist

-   [#661](https://github.com/worktile/plait/pull/661) [`c68584c7`](https://github.com/worktile/plait/commit/c68584c7e5f18f1a98f50485c1c8eb06d941923b) Thanks [@WBbug](https://github.com/WBbug)! - change reduceRouteMargin

## 0.35.0

## 0.34.0

### Minor Changes

-   [#648](https://github.com/worktile/plait/pull/648) [`baeca78f`](https://github.com/worktile/plait/commit/baeca78fc922fab56ff91b0a50ec0d7e2f96f484) Thanks [@WBbug](https://github.com/WBbug)! - add memorize

*   [#650](https://github.com/worktile/plait/pull/650) [`930a284a`](https://github.com/worktile/plait/commit/930a284a598748a5f41f21f690fd6d82600c0079) Thanks [@WBbug](https://github.com/WBbug)! - add transform

### Patch Changes

-   [`941a7d00`](https://github.com/worktile/plait/commit/941a7d00f8a3ab7e1ae0bc855048e6cd764b2ee1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct general can resize condition

## 0.33.0

### Minor Changes

-   [#636](https://github.com/worktile/plait/pull/636) [`6c2a693b`](https://github.com/worktile/plait/commit/6c2a693b75c6637067e624f1386bb1da43d219c2) Thanks [@WBbug](https://github.com/WBbug)! - support auto complete

*   [`385eebb2`](https://github.com/worktile/plait/commit/385eebb2601f718dcf9c4d3806c3d3ad34384a13) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update generator function name

-   [`a4864124`](https://github.com/worktile/plait/commit/a4864124d47e7b3f8811f4ec7b26e2f3f331e216) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename drawer to generator

### Patch Changes

-   [`fff12077`](https://github.com/worktile/plait/commit/fff120778974307456176ed2f6e72c85fa7aaedb) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modified setProperty position and function's arguments

## 0.32.0

### Minor Changes

-   [#634](https://github.com/worktile/plait/pull/634) [`c096f853`](https://github.com/worktile/plait/commit/c096f8538a72eb7daab8821c7784f4de3d9f7e9d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent text from being selected when user pressed shift and pointer down

*   [#634](https://github.com/worktile/plait/pull/634) [`8bf33508`](https://github.com/worktile/plait/commit/8bf33508a704e26c37436c453f14882aa5112953) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove selected element if include

-   [#634](https://github.com/worktile/plait/pull/634) [`3d9ae405`](https://github.com/worktile/plait/commit/3d9ae4057a3d0bfb617a23ea302c50b3cbe42c3f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add user-select: node in firefox browser

*   [#628](https://github.com/worktile/plait/pull/628) [`d41b1341`](https://github.com/worktile/plait/commit/d41b134155ddefeb82570c7202847423d733095d) Thanks [@WBbug](https://github.com/WBbug)! - optimize line when stroke wider

### Patch Changes

-   [#632](https://github.com/worktile/plait/pull/632) [`4acfa3a0`](https://github.com/worktile/plait/commit/4acfa3a054893e939baaf08155506c1dca5a163a) Thanks [@WBbug](https://github.com/WBbug)! - fix get wrong corner count

*   [#629](https://github.com/worktile/plait/pull/629) [`3a855a03`](https://github.com/worktile/plait/commit/3a855a03a63d6b53381244bcdd0565692027c6d8) Thanks [@WBbug](https://github.com/WBbug)! - set default value when result is NaN

## 0.31.0

### Minor Changes

-   [#627](https://github.com/worktile/plait/pull/627) [`dfb55270`](https://github.com/worktile/plait/commit/dfb552706df93ba6797004c4746fb1aff3e45924) Thanks [@WBbug](https://github.com/WBbug)! - support resize by moving border

*   [`a929b1e5`](https://github.com/worktile/plait/commit/a929b1e577c25811e33e77587c583c1773e18916) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct image hit logic and handle fill equals transparent issue

## 0.30.0

### Minor Changes

-   [#625](https://github.com/worktile/plait/pull/625) [`1bd7f3fd`](https://github.com/worktile/plait/commit/1bd7f3fdc63cf0a036af378f7d1b60adf3bf4673) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - optimize performance

*   [`882c5e1e`](https://github.com/worktile/plait/commit/882c5e1e247d5411c9f8f7527acad910301a479b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move cached element of focused image to common
    add override function isImageBindingAllowed

-   [#620](https://github.com/worktile/plait/pull/620) [`c02e846c`](https://github.com/worktile/plait/commit/c02e846c615afe44d474da5eaf97da93646c045a) Thanks [@WBbug](https://github.com/WBbug)! - add a-star algorithms

## 0.29.0

## 0.28.0

### Minor Changes

-   release 0.28.0

## 0.1.0

### Minor Changes

-   [`653109b8`](https://github.com/worktile/plait/commit/653109b836c5707ec03714a801e3a167ad4e6263) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle touch target to avoid touch move event not fire

*   [#590](https://github.com/worktile/plait/pull/590) [`3280fac4`](https://github.com/worktile/plait/commit/3280fac4d2b7425e8881539c70c1cdb731afab81) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getTangentSlope and getVectorBySlope for ellipse
    improve ellipse connection handle direction
    improve triangle、trapezoid、right-arrow、left-arrow connection handle direction

-   [#532](https://github.com/worktile/plait/pull/532) [`a7dfd850`](https://github.com/worktile/plait/commit/a7dfd850732c43f99aaff4e336bcda16768b93c0) Thanks [@WBbug](https://github.com/WBbug)! - support keyDown edit text

*   [`b8c9d871`](https://github.com/worktile/plait/commit/b8c9d8718f02af6a15161b044ba7cc6c6a6990a9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - do not show resize handle for geometry when isSelectionMoving is true
    do not show resize handle for geometry text when text is editing

-   [`96b9a236`](https://github.com/worktile/plait/commit/96b9a236b52207766627bbca357b64957e9e4c37) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add GeometryThreshold constant
    fix text foreign object width less 0 error

*   [#572](https://github.com/worktile/plait/pull/572) [`3ea149bf`](https://github.com/worktile/plait/commit/3ea149bff968ac1d02b86fe2526ff6db094fec23) Thanks [@WBbug](https://github.com/WBbug)! - add common Transform

-   [#538](https://github.com/worktile/plait/pull/538) [`4103169e`](https://github.com/worktile/plait/commit/4103169e769bb833166d131386cd4fd0116490de) Thanks [@WBbug](https://github.com/WBbug)! - cancel active when resizing line and add active when end resizing

*   [#546](https://github.com/worktile/plait/pull/546) [`ce969afa`](https://github.com/worktile/plait/commit/ce969afabb146f3d0be01083e59c28f868d16a3c) Thanks [@WBbug](https://github.com/WBbug)! - add other geometry shape

-   [#548](https://github.com/worktile/plait/pull/548) [`b52dadc3`](https://github.com/worktile/plait/commit/b52dadc3ca405b343bd8f48d8cb2d95776df9f2e) Thanks [@WBbug](https://github.com/WBbug)! - add text mask

*   [#569](https://github.com/worktile/plait/pull/569) [`fa40539b`](https://github.com/worktile/plait/commit/fa40539bd764add1936e4fd5a9f27bf2f11965de) Thanks [@WBbug](https://github.com/WBbug)! - support straight line

-   [#544](https://github.com/worktile/plait/pull/544) [`425d323b`](https://github.com/worktile/plait/commit/425d323ba02873f709cf5a41698bec197342485a) Thanks [@WBbug](https://github.com/WBbug)! - support add text on line

*   [#585](https://github.com/worktile/plait/pull/585) [`ba6d2eeb`](https://github.com/worktile/plait/commit/ba6d2eebcb0928a2637e57effe70447b36f5cd80) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve line handle direction logic

-   [#601](https://github.com/worktile/plait/pull/601) [`ddd009c8`](https://github.com/worktile/plait/commit/ddd009c857c319b9680bf0395c7a490ac1f10ab2) Thanks [@WBbug](https://github.com/WBbug)! - support image

*   [#531](https://github.com/worktile/plait/pull/531) [`6f41359c`](https://github.com/worktile/plait/commit/6f41359c5e20162e0ce92eb34f9e0b396905d0df) Thanks [@WBbug](https://github.com/WBbug)! - support create and select line

-   [#596](https://github.com/worktile/plait/pull/596) [`9312e350`](https://github.com/worktile/plait/commit/9312e35038237c9b7b25330bab55d9371601a296) Thanks [@WBbug](https://github.com/WBbug)! - support curve

*   [#516](https://github.com/worktile/plait/pull/516) [`d878a467`](https://github.com/worktile/plait/commit/d878a467233b9f894a2fed562800eb6007cfbc3e) Thanks [@WBbug](https://github.com/WBbug)! - support create rectangle

-   [`d8a77123`](https://github.com/worktile/plait/commit/d8a771232a4fc8539abc2408646b55834af2b00c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - draw line support resize

*   [`2300b4f7`](https://github.com/worktile/plait/commit/2300b4f7853b033df85a7e01b837a810bb5453ec) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add override function getDeletedFragment and handle deleted element by the return result of getDeletedFragment

-   [`ba8e59c4`](https://github.com/worktile/plait/commit/ba8e59c4c6c7180ea3b9b7ec31a58075dd57f1ff) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - draw geometry support resize

*   [`42cdd3bd`](https://github.com/worktile/plait/commit/42cdd3bd692712c6a117b780a135fff863e4abed) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support draw-element copy and paste

-   [`aedbae54`](https://github.com/worktile/plait/commit/aedbae5464735592f7682335c14cf1e733b9e46d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update geometry stroke width generate logic

*   [#536](https://github.com/worktile/plait/pull/536) [`abf36572`](https://github.com/worktile/plait/commit/abf365723493220ae3c06461a93a38935272e1c7) Thanks [@WBbug](https://github.com/WBbug)! - support line bound geometry

-   [#589](https://github.com/worktile/plait/pull/589) [`1af013ed`](https://github.com/worktile/plait/commit/1af013edf83f5499314ead60424eaab23fb1764e) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support standalone component

*   [#526](https://github.com/worktile/plait/pull/526) [`9b2cc192`](https://github.com/worktile/plait/commit/9b2cc192c0dca93aedb51b489f6d11e98e1ba6d5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add common with resize and common active generator

-   [`df94abc0`](https://github.com/worktile/plait/commit/df94abc0a5957e868844fa541a60045b404a84d6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve line arrow drawing

*   [`06a3a57d`](https://github.com/worktile/plait/commit/06a3a57deac23520b9a0b535e27ca7aaf1f0ef8b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - `draw`: support draw elements delete
    `core`: invoke deleteFragment when use press delete or backspace

-   [#534](https://github.com/worktile/plait/pull/534) [`ca2b06aa`](https://github.com/worktile/plait/commit/ca2b06aaad052f352c56f1b323f721d35fd2c854) Thanks [@WBbug](https://github.com/WBbug)! - support draw arrow

### Patch Changes

-   [#592](https://github.com/worktile/plait/pull/592) [`832689e4`](https://github.com/worktile/plait/commit/832689e4b0d41c78136b33bc79244e01c670c24f) Thanks [@Maple13](https://github.com/Maple13)! - build: update peerDependencies

*   [#608](https://github.com/worktile/plait/pull/608) [`6805a1ad`](https://github.com/worktile/plait/commit/6805a1adb7470f49c0f25311b721107cc9c9769e) Thanks [@WBbug](https://github.com/WBbug)! - add handle judge

-   [#559](https://github.com/worktile/plait/pull/559) [`7b4a41f6`](https://github.com/worktile/plait/commit/7b4a41f65cac8b42b11557c1d1266f3f559582d7) Thanks [@WBbug](https://github.com/WBbug)! - add merging when resizing

*   [`06521543`](https://github.com/worktile/plait/commit/065215431516fce35a47919fff1f9caeece38491) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - assign multiple active stroke opacity 0.5
    correct isMoving condition for line

-   [`abaec9c7`](https://github.com/worktile/plait/commit/abaec9c7333c6675ab6b12277f868cfef3bb6746) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - use [replaceWith] replace appendChild to avoid g position update when edit text

*   [#568](https://github.com/worktile/plait/pull/568) [`5303802b`](https://github.com/worktile/plait/commit/5303802b50396165663db5b72d82fd720ac89b00) Thanks [@WBbug](https://github.com/WBbug)! - add WithTextPluginKey in common

-   [`59e75dbe`](https://github.com/worktile/plait/commit/59e75dbe03ce59592914fd9ad0e2b80c3d2645c5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modify resize handle diameter from 10 to 8

## 0.1.0-next.10

### Minor Changes

-   [#601](https://github.com/worktile/plait/pull/601) [`ddd009c8`](https://github.com/worktile/plait/commit/ddd009c857c319b9680bf0395c7a490ac1f10ab2) Thanks [@WBbug](https://github.com/WBbug)! - support image

*   [#596](https://github.com/worktile/plait/pull/596) [`9312e350`](https://github.com/worktile/plait/commit/9312e35038237c9b7b25330bab55d9371601a296) Thanks [@WBbug](https://github.com/WBbug)! - support curve

-   [#589](https://github.com/worktile/plait/pull/589) [`1af013ed`](https://github.com/worktile/plait/commit/1af013edf83f5499314ead60424eaab23fb1764e) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support standalone component

### Patch Changes

-   [#608](https://github.com/worktile/plait/pull/608) [`6805a1ad`](https://github.com/worktile/plait/commit/6805a1adb7470f49c0f25311b721107cc9c9769e) Thanks [@WBbug](https://github.com/WBbug)! - add handle judge

## 0.1.0-next.9

### Minor Changes

-   [#590](https://github.com/worktile/plait/pull/590) [`3280fac4`](https://github.com/worktile/plait/commit/3280fac4d2b7425e8881539c70c1cdb731afab81) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getTangentSlope and getVectorBySlope for ellipse
    improve ellipse connection handle direction
    improve triangle、trapezoid、right-arrow、left-arrow connection handle direction

*   [#585](https://github.com/worktile/plait/pull/585) [`ba6d2eeb`](https://github.com/worktile/plait/commit/ba6d2eebcb0928a2637e57effe70447b36f5cd80) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve line handle direction logic

### Patch Changes

-   [#592](https://github.com/worktile/plait/pull/592) [`832689e4`](https://github.com/worktile/plait/commit/832689e4b0d41c78136b33bc79244e01c670c24f) Thanks [@Maple13](https://github.com/Maple13)! - build: update peerDependencies

## 0.1.0-next.8

### Patch Changes

-   [`06521543`](https://github.com/worktile/plait/commit/065215431516fce35a47919fff1f9caeece38491) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - assign multiple active stroke opacity 0.5
    correct isMoving condition for line

## 0.1.0-next.7

### Minor Changes

-   [`653109b8`](https://github.com/worktile/plait/commit/653109b836c5707ec03714a801e3a167ad4e6263) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle touch target to avoid touch move event not fire

*   [#572](https://github.com/worktile/plait/pull/572) [`3ea149bf`](https://github.com/worktile/plait/commit/3ea149bff968ac1d02b86fe2526ff6db094fec23) Thanks [@WBbug](https://github.com/WBbug)! - add common Transform

-   [`aedbae54`](https://github.com/worktile/plait/commit/aedbae5464735592f7682335c14cf1e733b9e46d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update geometry stroke width generate logic

## 0.1.0-next.6

### Minor Changes

-   [#569](https://github.com/worktile/plait/pull/569) [`fa40539b`](https://github.com/worktile/plait/commit/fa40539bd764add1936e4fd5a9f27bf2f11965de) Thanks [@WBbug](https://github.com/WBbug)! - support straight line

*   [`2300b4f7`](https://github.com/worktile/plait/commit/2300b4f7853b033df85a7e01b837a810bb5453ec) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add override function getDeletedFragment and handle deleted element by the return result of getDeletedFragment

### Patch Changes

-   [#568](https://github.com/worktile/plait/pull/568) [`5303802b`](https://github.com/worktile/plait/commit/5303802b50396165663db5b72d82fd720ac89b00) Thanks [@WBbug](https://github.com/WBbug)! - add WithTextPluginKey in common

## 0.1.0-next.5

### Minor Changes

-   [`df94abc0`](https://github.com/worktile/plait/commit/df94abc0a5957e868844fa541a60045b404a84d6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve line arrow drawing

## 0.1.0-next.4

### Minor Changes

-   [`b8c9d871`](https://github.com/worktile/plait/commit/b8c9d8718f02af6a15161b044ba7cc6c6a6990a9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - do not show resize handle for geometry when isSelectionMoving is true
    do not show resize handle for geometry text when text is editing

### Patch Changes

-   [#559](https://github.com/worktile/plait/pull/559) [`7b4a41f6`](https://github.com/worktile/plait/commit/7b4a41f65cac8b42b11557c1d1266f3f559582d7) Thanks [@WBbug](https://github.com/WBbug)! - add merging when resizing

*   [`abaec9c7`](https://github.com/worktile/plait/commit/abaec9c7333c6675ab6b12277f868cfef3bb6746) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - use [replaceWith] replace appendChild to avoid g position update when edit text

## 0.1.0-next.3

### Minor Changes

-   [`96b9a236`](https://github.com/worktile/plait/commit/96b9a236b52207766627bbca357b64957e9e4c37) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add GeometryThreshold constant
    fix text foreign object width less 0 error

*   [#538](https://github.com/worktile/plait/pull/538) [`4103169e`](https://github.com/worktile/plait/commit/4103169e769bb833166d131386cd4fd0116490de) Thanks [@WBbug](https://github.com/WBbug)! - cancel active when resizing line and add active when end resizing

-   [#546](https://github.com/worktile/plait/pull/546) [`ce969afa`](https://github.com/worktile/plait/commit/ce969afabb146f3d0be01083e59c28f868d16a3c) Thanks [@WBbug](https://github.com/WBbug)! - add other geometry shape

*   [#548](https://github.com/worktile/plait/pull/548) [`b52dadc3`](https://github.com/worktile/plait/commit/b52dadc3ca405b343bd8f48d8cb2d95776df9f2e) Thanks [@WBbug](https://github.com/WBbug)! - add text mask

-   [#544](https://github.com/worktile/plait/pull/544) [`425d323b`](https://github.com/worktile/plait/commit/425d323ba02873f709cf5a41698bec197342485a) Thanks [@WBbug](https://github.com/WBbug)! - support add text on line

*   [#536](https://github.com/worktile/plait/pull/536) [`abf36572`](https://github.com/worktile/plait/commit/abf365723493220ae3c06461a93a38935272e1c7) Thanks [@WBbug](https://github.com/WBbug)! - support line bound geometry

## 0.1.0-next.2

### Minor Changes

-   [#532](https://github.com/worktile/plait/pull/532) [`a7dfd850`](https://github.com/worktile/plait/commit/a7dfd850732c43f99aaff4e336bcda16768b93c0) Thanks [@WBbug](https://github.com/WBbug)! - support keyDown edit text

*   [#531](https://github.com/worktile/plait/pull/531) [`6f41359c`](https://github.com/worktile/plait/commit/6f41359c5e20162e0ce92eb34f9e0b396905d0df) Thanks [@WBbug](https://github.com/WBbug)! - support create and select line

-   [`d8a77123`](https://github.com/worktile/plait/commit/d8a771232a4fc8539abc2408646b55834af2b00c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - draw line support resize

*   [`ba8e59c4`](https://github.com/worktile/plait/commit/ba8e59c4c6c7180ea3b9b7ec31a58075dd57f1ff) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - draw geometry support resize

-   [#534](https://github.com/worktile/plait/pull/534) [`ca2b06aa`](https://github.com/worktile/plait/commit/ca2b06aaad052f352c56f1b323f721d35fd2c854) Thanks [@WBbug](https://github.com/WBbug)! - support draw arrow

## 0.1.0-next.1

### Patch Changes

-   [`59e75dbe`](https://github.com/worktile/plait/commit/59e75dbe03ce59592914fd9ad0e2b80c3d2645c5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modify resize handle diameter from 10 to 8

## 0.1.0-next.0

### Minor Changes

-   [#516](https://github.com/worktile/plait/pull/516) [`d878a467`](https://github.com/worktile/plait/commit/d878a467233b9f894a2fed562800eb6007cfbc3e) Thanks [@WBbug](https://github.com/WBbug)! - support create rectangle

*   [`42cdd3bd`](https://github.com/worktile/plait/commit/42cdd3bd692712c6a117b780a135fff863e4abed) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support draw-element copy and paste

-   [#526](https://github.com/worktile/plait/pull/526) [`9b2cc192`](https://github.com/worktile/plait/commit/9b2cc192c0dca93aedb51b489f6d11e98e1ba6d5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add common with resize and common active generator

*   [`06a3a57d`](https://github.com/worktile/plait/commit/06a3a57deac23520b9a0b535e27ca7aaf1f0ef8b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - `draw`: support draw elements delete
    `core`: invoke deleteFragment when use press delete or backspace
