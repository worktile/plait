# @plait/flow

## 0.60.0

## 0.59.0

## 0.58.0

## 0.57.0

### Minor Changes

-   [#857](https://github.com/worktile/plait/pull/857) [`b4e7bb954`](https://github.com/worktile/plait/commit/b4e7bb954df70d2071fc128a339532d3c9782bf9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle edge's g hierarchy logic

    edge 层级需求：

    1. 默认情况下 edge 的 label 部件层级应该高于其它 edge 连线
    2. 默认情况下 node 部件层级应该高于 edge 连线
    3. edge 元素处于 active（选中）/ highlight（选中关联节点）/ hovering 时给 edge 元素置于最高层，可以盖住其它 edge 的 label 和 其它任何 node 节点

    处理思路：

    1. 默认情况下将 edge 的「连线部件」放到 lowerHost 中，保证默认情况下 edge label 和 node 节点部件的层级高于 edge 的连线
    2. 其它情况（active/highlight/hovering）将 edge 的「连线部件」放到当前 edge 元素的 elementG 中，并且提升 elementG 整体层级（放到 upperHost 中，默认放到 host 中）

    edge level requirements:

    1. By default, the edge label component level should be higher than other edge connections.
    2. By default, the node component level should be higher than the edge connection
    3. When the edge element is active (selected)/highlight (selected associated node)/hovering, place the edge element at the top level, which can cover other edge labels and any other node nodes.

    Processing ideas:

    1. By default, the edge's "connection component" is placed in lowerHost to ensure that the edge label and node node components are higher than the edge's connection by default.
    2. In other cases (active/highlight/hovering), place the edge's "connection component" in elementG of the current edge element, and raise the overall level of elementG (put it in upperHost, by default it will be placed in host)

*   [#857](https://github.com/worktile/plait/pull/857) [`d9cea82d2`](https://github.com/worktile/plait/commit/d9cea82d280e48b91952a5cfa983f2f468d49e24) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor plait/flow's rendering

    remove getComponent invoking in plait/flow

## 0.56.2

## 0.56.1

## 0.56.0

## 0.55.1

## 0.55.0

## 0.54.0

## 0.53.0

## 0.51.4

## 0.52.0

### Minor Changes

-   [`6b6678df`](https://github.com/worktile/plait/commit/6b6678dfd65d9cfe1b80726afdd9ef4044d9202a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - bump angular into v17

### Patch Changes

-   [`c7565c08`](https://github.com/worktile/plait/commit/c7565c08e6d52a91e2df87ac5405bdcd21406cbb) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename getPointByVector to getPointByVectorComponent
    rename getPointByUnitVectorAndDirectionComponent to getPointByVectorDirectionComponent

## 0.52.0-next.0

### Minor Changes

-   [`6b6678df`](https://github.com/worktile/plait/commit/6b6678dfd65d9cfe1b80726afdd9ef4044d9202a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - bump angular into v17

### Patch Changes

-   [`c7565c08`](https://github.com/worktile/plait/commit/c7565c08e6d52a91e2df87ac5405bdcd21406cbb) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename getPointByVector to getPointByVectorComponent
    rename getPointByUnitVectorAndDirectionComponent to getPointByVectorDirectionComponent

## 0.51.3

## 0.51.2

## 0.51.1

### Patch Changes

-   [#761](https://github.com/worktile/plait/pull/761) [`134e669f`](https://github.com/worktile/plait/commit/134e669f84c0c1e57368a1aae30275e0f4c6bee3) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - use pointer event
    fix can't move node after refresh page

## 0.51.0

### Minor Changes

-   [`c135b9d4`](https://github.com/worktile/plait/commit/c135b9d4a5940aabb15763541fd1e9616e799877) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add ACTIVE_MOVING_CLASS_NAME class to avoid the dom element in active host being invisible when flow node is moving

*   [#742](https://github.com/worktile/plait/pull/742) [`1c3cfa4d`](https://github.com/worktile/plait/commit/1c3cfa4d35c9d7b1d1c2c553546a81337e89bdfc) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - throttleRAF support set key and board to avoid the effect of multiple scene call

-   [#714](https://github.com/worktile/plait/pull/714) [`541bd50d`](https://github.com/worktile/plait/commit/541bd50dc64477d526ca959635b2ff3ad7494f70) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - elbow-line supports dragging to adjust the inflection point
    extract getSourceAndTargetOuterRectangle to common
    extract isSourceAndTargetIntersect to common
    add isHorizontalSegment to core
    add isVerticalSegment to core
    add isPointsOnSameLine to core
    refactor getElbowPoints when points.length > 2

## 0.50.1

## 0.50.0

## 0.49.0

### Minor Changes

-   [`8250c28a`](https://github.com/worktile/plait/commit/8250c28a0580eb06a7a1a297871df263869167fa) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - extract to-point to handle coordinate transform

## 0.48.0

## 0.47.0

### Minor Changes

-   [`85562abc`](https://github.com/worktile/plait/commit/85562abc2af58991c1ce50a2e140a4f72ef02942) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - skip 0.46.0

## 0.46.0

## 0.45.0

## 0.44.0

## 0.43.0

## 0.42.0

## 0.41.0

## 0.40.0

## 0.39.0

## 0.38.0

## 0.37.0

## 0.36.0

### Patch Changes

-   [#657](https://github.com/worktile/plait/pull/657) [`d1b30b4a`](https://github.com/worktile/plait/commit/d1b30b4aedc5ce6f829b2b149eab48a03ce4548c) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - set default label font-size to 12

## 0.35.0

## 0.34.0

### Patch Changes

-   [#649](https://github.com/worktile/plait/pull/649) [`f873d18b`](https://github.com/worktile/plait/commit/f873d18b32a3fde85c4f54e972dbbd639c90edcd) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support handle offset

## 0.33.0

### Patch Changes

-   [#635](https://github.com/worktile/plait/pull/635) [`0f27705d`](https://github.com/worktile/plait/commit/0f27705debcafb95da55272cd2ff19d7a35fb8ad) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - replace get edge points algorithm

*   [#646](https://github.com/worktile/plait/pull/646) [`aa6fb8d2`](https://github.com/worktile/plait/commit/aa6fb8d25560375cec91812b11f78ce1db8117e4) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support curve and straight edge and adjust label

## 0.32.0

### Minor Changes

-   [#628](https://github.com/worktile/plait/pull/628) [`d41b1341`](https://github.com/worktile/plait/commit/d41b134155ddefeb82570c7202847423d733095d) Thanks [@WBbug](https://github.com/WBbug)! - optimize line when stroke wider

## 0.31.0

## 0.30.0

### Minor Changes

-   [`8eae35a8`](https://github.com/worktile/plait/commit/8eae35a8440b00f29d9349a8ad6ea87ae4cb01ce) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename isHitSelection to isRectangleHit

*   [`09c7083a`](https://github.com/worktile/plait/commit/09c7083af9f52ee6b6bef70dad99c68da4ad1e3e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add overridable function isHit

## 0.29.0

## 0.28.0

### Minor Changes

-   release 0.28.0

## 0.6.0

### Minor Changes

-   [#521](https://github.com/worktile/plait/pull/521) [`ddb416f4`](https://github.com/worktile/plait/commit/ddb416f4ad33b53cbed7d6257b834c3b2108b688) Thanks [@WBbug](https://github.com/WBbug)! - support wrap line when has autoSize

*   [#589](https://github.com/worktile/plait/pull/589) [`1af013ed`](https://github.com/worktile/plait/commit/1af013edf83f5499314ead60424eaab23fb1764e) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support standalone component

### Patch Changes

-   [#530](https://github.com/worktile/plait/pull/530) [`cbebbb0b`](https://github.com/worktile/plait/commit/cbebbb0b1abd910e9441ccbea8c22de54255f77f) Thanks [@xinglu01](https://github.com/xinglu01)! - handle fix bugs after layered rendering

*   [#542](https://github.com/worktile/plait/pull/542) [`cab3d1d8`](https://github.com/worktile/plait/commit/cab3d1d8879a0b868b78b945f3cfae178a655cde) Thanks [@xinglu01](https://github.com/xinglu01)! - optimize the number of getEdgePoints function calls

-   [#522](https://github.com/worktile/plait/pull/522) [`fa7760ba`](https://github.com/worktile/plait/commit/fa7760bae7564f03763d10753f37a4f4a87fbe53) Thanks [@xinglu01](https://github.com/xinglu01)! - support selected node relation edge highlight

*   [#549](https://github.com/worktile/plait/pull/549) [`89a02986`](https://github.com/worktile/plait/commit/89a02986166c9499e18c51f1f58c231a02c874ba) Thanks [@xinglu01](https://github.com/xinglu01)! - export styles by flow

## 0.6.0-next.3

### Minor Changes

-   [#589](https://github.com/worktile/plait/pull/589) [`1af013ed`](https://github.com/worktile/plait/commit/1af013edf83f5499314ead60424eaab23fb1764e) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support standalone component

## 0.6.0-next.2

### Patch Changes

-   [#542](https://github.com/worktile/plait/pull/542) [`cab3d1d8`](https://github.com/worktile/plait/commit/cab3d1d8879a0b868b78b945f3cfae178a655cde) Thanks [@xinglu01](https://github.com/xinglu01)! - optimize the number of getEdgePoints function calls

*   [#549](https://github.com/worktile/plait/pull/549) [`89a02986`](https://github.com/worktile/plait/commit/89a02986166c9499e18c51f1f58c231a02c874ba) Thanks [@xinglu01](https://github.com/xinglu01)! - export styles by flow

## 0.5.7

### Patch Changes

-   [`bb11ae99`](https://github.com/worktile/plait/commit/bb11ae993e801f58eaf2edd5a80d0b1330c013e1) Thanks [@xinglu01](https://github.com/xinglu01)! - optimize the calculation of label position and add the function of obtaining equal coordinates

*   [`6eb5dc76`](https://github.com/worktile/plait/commit/6eb5dc76739a457e46c8b06a2cfc05743bb20902) Thanks [@xinglu01](https://github.com/xinglu01)! - support getOverlapEdges function by staggered display of label

## 0.5.6

### Patch Changes

-   [#530](https://github.com/worktile/plait/pull/530) [`cbebbb0b`](https://github.com/worktile/plait/commit/cbebbb0b1abd910e9441ccbea8c22de54255f77f) Thanks [@xinglu01](https://github.com/xinglu01)! - handle fix bugs after layered rendering

## 0.6.0-next.0

### Minor Changes

-   [#521](https://github.com/worktile/plait/pull/521) [`ddb416f4`](https://github.com/worktile/plait/commit/ddb416f4ad33b53cbed7d6257b834c3b2108b688) Thanks [@WBbug](https://github.com/WBbug)! - support wrap line when has autoSize

### Patch Changes

-   [#522](https://github.com/worktile/plait/pull/522) [`fa7760ba`](https://github.com/worktile/plait/commit/fa7760bae7564f03763d10753f37a4f4a87fbe53) Thanks [@xinglu01](https://github.com/xinglu01)! - support selected node relation edge highlight

## 0.5.5

### Patch Changes

-   [`e98303aa`](https://github.com/worktile/plait/commit/e98303aae5b5ae17ab7d5cf5953daae5d897483c) Thanks [@xinglu01](https://github.com/xinglu01)! - support node and edge highlight when hover

*   [`191c901a`](https://github.com/worktile/plait/commit/191c901a6d642c67d280da32321b9e8de18a8844) Thanks [@xinglu01](https://github.com/xinglu01)! - support selected node relation edge highlight

## 0.5.4

### Patch Changes

-   [#487](https://github.com/worktile/plait/pull/487) [`4a471b0f`](https://github.com/worktile/plait/commit/4a471b0f322197052530f5ee6b4088e591693b14) Thanks [@xinglu01](https://github.com/xinglu01)! - support edge label set width

## 0.5.3

### Patch Changes

-   [#478](https://github.com/worktile/plait/pull/478) [`aed9862f`](https://github.com/worktile/plait/commit/aed9862fe37b3237b18e8a79cafb4790d4d52f19) Thanks [@xinglu01](https://github.com/xinglu01)! - handle edge label position

*   [#479](https://github.com/worktile/plait/pull/479) [`be78b211`](https://github.com/worktile/plait/commit/be78b2118f5982b5b8e264a236e283ebd4806d94) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix: exec redraw when previous.selected is true

## 0.5.2

### Patch Changes

-   [`f00a5e29`](https://github.com/worktile/plait/commit/f00a5e290af9da1603e9f07d6a8b45ceb88405b1) Thanks [@xinglu01](https://github.com/xinglu01)! - delete create edge info when not active handle element

*   [`30d3eca9`](https://github.com/worktile/plait/commit/30d3eca9016779afe60946e594744ea4eb5e8e81) Thanks [@xinglu01](https://github.com/xinglu01)! - read only mode disable selection and dragging

## 0.5.1

### Patch Changes

-   [#466](https://github.com/worktile/plait/pull/466) [`68a3fb3d`](https://github.com/worktile/plait/commit/68a3fb3df52de1d28c9b257c781927dcd813c975) Thanks [@xinglu01](https://github.com/xinglu01)! - handle support edge height setting

## 0.5.0

### Minor Changes

-   [`f6c69574`](https://github.com/worktile/plait/commit/f6c69574caf8cdbbf7850695388757a90ed9cc25) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor get text size

## 0.4.1

### Patch Changes

-   [#451](https://github.com/worktile/plait/pull/451) [`04c2045`](https://github.com/worktile/plait/commit/04c20452c3ad2d77c95589edcc2fe84eefa7cd26) Thanks [@xinglu01](https://github.com/xinglu01)! - handle line connection is missing

## 0.4.0

### Minor Changes

-   [#444](https://github.com/worktile/plait/pull/444) [`bfed049`](https://github.com/worktile/plait/commit/bfed049358c192730dd09553f91e3a046f80213a) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support edge label icon

*   [#442](https://github.com/worktile/plait/pull/442) [`cecf8ff`](https://github.com/worktile/plait/commit/cecf8fff663969f970c7d28ae5a74c4994c8a99d) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support handle hover style and optimize css style

## 0.3.0

### Minor Changes

-   [#430](https://github.com/worktile/plait/pull/430) [`372ecab`](https://github.com/worktile/plait/commit/372ecabf88382c58382d992f3041e45b9aac7584) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - replace richtext component by slate-angular

*   [#430](https://github.com/worktile/plait/pull/430) [`275f9ce`](https://github.com/worktile/plait/commit/275f9ce077b652f7cd01fb6c994034243aea7742) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add format text

-   [#430](https://github.com/worktile/plait/pull/430) [`7adcf10`](https://github.com/worktile/plait/commit/7adcf1003d699d61bab5512f5e72817697270a19) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename richtext to text

*   [#430](https://github.com/worktile/plait/pull/430) [`81d3d9d`](https://github.com/worktile/plait/commit/81d3d9d2e628ad1d41488516b2ffec2aad4dc69c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename richtext to text

-   [#434](https://github.com/worktile/plait/pull/434) [`3d758a8`](https://github.com/worktile/plait/commit/3d758a8caef7e6c6d1fa41a11fe59decf784ae31) Thanks [@WBbug](https://github.com/WBbug)! - support change text mark

### Patch Changes

-   [#437](https://github.com/worktile/plait/pull/437) [`e1fa8d5`](https://github.com/worktile/plait/commit/e1fa8d5670187684af2165d9396daa76691f6dd0) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve text size utils method
    fix text paste error

## 0.2.5

### Patch Changes

-   [#409](https://github.com/worktile/plait/pull/409) [`4a9e0f7`](https://github.com/worktile/plait/commit/4a9e0f760492e80d409f6cecc9541ec01b183811) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support borderRadius and prevent draw handle and mask when isActive is false

## 0.2.4

### Patch Changes

-   [#403](https://github.com/worktile/plait/pull/403) [`5c14d03`](https://github.com/worktile/plait/commit/5c14d030b6a99143a07746b68d4d096c7a3721a9) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - prevent draw richtext when text is null

## 0.2.3

### Patch Changes

-   [#393](https://github.com/worktile/plait/pull/393) [`47791b9`](https://github.com/worktile/plait/commit/47791b96a6d13e09a77bd73f90183b8e620656f3) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - export draw files

## 0.2.2

### Patch Changes

-   [#383](https://github.com/worktile/plait/pull/383) [`145e16a`](https://github.com/worktile/plait/commit/145e16aaeea2c26f56508bbf6288b5cad71841e4) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - optmzie edge type

*   [#363](https://github.com/worktile/plait/pull/363) [`b3780eb`](https://github.com/worktile/plait/commit/b3780ebeeffa3553516a420528c53e73a2e89504) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - adjust critical selection

-   [#386](https://github.com/worktile/plait/pull/386) [`a6e9391`](https://github.com/worktile/plait/commit/a6e93914186337778ec954c62512cab263890b3b) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - bump peerDependencies angular version to 15.x

## 0.2.1

### Patch Changes

-   [#371](https://github.com/worktile/plait/pull/371) [`3f81f9e`](https://github.com/worktile/plait/commit/3f81f9e3bc16e8465994011e7fd4c18493279298) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - use CommonModule instead of BrowserModule

## 0.2.0

### Minor Changes

-   [#321](https://github.com/worktile/plait/pull/321) [`fe2bbb6`](https://github.com/worktile/plait/commit/fe2bbb60e0a452f98383a81eff0fb77a32f7ddc7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor plait core plugin element component structure

*   [`304f2b9`](https://github.com/worktile/plait/commit/304f2b9a613266e5f73b4d3b3403f6ad7aa1b9a2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename package name to mind

### Patch Changes

-   [#359](https://github.com/worktile/plait/pull/359) [`7b3f522`](https://github.com/worktile/plait/commit/7b3f5227ba13acb0a0fa6a7259a18286c7e139e3) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - set g node to top when focus

*   [`da64e36`](https://github.com/worktile/plait/commit/da64e36cda13300ea6c30535dfdb4a6525f70482) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename isIntersect to isHit and fix isHit float calculate error

-   [#314](https://github.com/worktile/plait/pull/314) [`67fa76c`](https://github.com/worktile/plait/commit/67fa76c1070609adec4c5c06262f0828ddaa6867) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support delete element

*   [#354](https://github.com/worktile/plait/pull/354) [`92849f3`](https://github.com/worktile/plait/commit/92849f3fb1739b100000d31593c5f21fa9b4905a) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add injector for CustomBoard

-   [#314](https://github.com/worktile/plait/pull/314) [`67fa76c`](https://github.com/worktile/plait/commit/67fa76c1070609adec4c5c06262f0828ddaa6867) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support create edge

## 0.2.0-next.3

### Patch Changes

-   [#359](https://github.com/worktile/plait/pull/359) [`7b3f522`](https://github.com/worktile/plait/commit/7b3f5227ba13acb0a0fa6a7259a18286c7e139e3) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - set g node to top when focus

## 0.2.0-next.2

### Patch Changes

-   [#354](https://github.com/worktile/plait/pull/354) [`92849f3`](https://github.com/worktile/plait/commit/92849f3fb1739b100000d31593c5f21fa9b4905a) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add injector for CustomBoard

## 0.2.0-next.1

### Patch Changes

-   [`da64e36`](https://github.com/worktile/plait/commit/da64e36cda13300ea6c30535dfdb4a6525f70482) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename isIntersect to isHit and fix isHit float calculate error

## 0.2.0-next.0

### Minor Changes

-   [#321](https://github.com/worktile/plait/pull/321) [`fe2bbb6`](https://github.com/worktile/plait/commit/fe2bbb60e0a452f98383a81eff0fb77a32f7ddc7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor plait core plugin element component structure

*   [`304f2b9`](https://github.com/worktile/plait/commit/304f2b9a613266e5f73b4d3b3403f6ad7aa1b9a2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename package name to mind

### Patch Changes

-   [#314](https://github.com/worktile/plait/pull/314) [`67fa76c`](https://github.com/worktile/plait/commit/67fa76c1070609adec4c5c06262f0828ddaa6867) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support delete element

*   [#314](https://github.com/worktile/plait/pull/314) [`67fa76c`](https://github.com/worktile/plait/commit/67fa76c1070609adec4c5c06262f0828ddaa6867) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support create edge

## 0.1.6

### Patch Changes

-   [#310](https://github.com/worktile/plait/pull/310) [`d1a9e6f`](https://github.com/worktile/plait/commit/d1a9e6fa9f5205ad077adb876e76a2cf653de73c) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - refactor T type

## 0.1.5

### Patch Changes

-   [#307](https://github.com/worktile/plait/pull/307) [`d6cb0ee`](https://github.com/worktile/plait/commit/d6cb0eee6a5c3bac4f6f0ee739e240a55c54d43d) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix the text is not centered

## 0.1.4

### Patch Changes

-   [#306](https://github.com/worktile/plait/pull/306) [`5313937`](https://github.com/worktile/plait/commit/5313937e0ff9e2852c79faf64fcf3ca443944613) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix: add getRectangle hook

## 0.1.3

### Patch Changes

-   [#286](https://github.com/worktile/plait/pull/286) [`d526031`](https://github.com/worktile/plait/commit/d5260317eb11ed0f9fb9101cd11eb2060883a4b3) Thanks [@WBbug](https://github.com/WBbug)! - change isIntersectionSelection to isHitSelection

## 0.1.2

### Patch Changes

-   [`4401da6`](https://github.com/worktile/plait/commit/4401da6a2a019d8c7078387eee6529a240b2e887) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct richtext position and size style

## 0.1.1

### Patch Changes

-   [#273](https://github.com/worktile/plait/pull/273) [`2e894d5`](https://github.com/worktile/plait/commit/2e894d5ee5ada069ca5c6ccfd968a0665a0e1422) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add withMove plugin

*   [#274](https://github.com/worktile/plait/pull/274) [`7ca6fa3`](https://github.com/worktile/plait/commit/7ca6fa32f080645ff907f392eb8bc6139b8d7b67) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add BOARD_TO_MOVING_ELEMENT and redraw edges when node change

## 0.1.0

### Minor Changes

-   [`42708c2`](https://github.com/worktile/plait/commit/42708c2880be02ed30280d75fc21bb3f143c7537) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Release v0.1.0 to welcome new members @plait/flow 🎉 🎉 🎉 !

### Patch Changes

-   [#268](https://github.com/worktile/plait/pull/268) [`0336a2a`](https://github.com/worktile/plait/commit/0336a2a3f0e614cddd412b7a8a49792a727400ea) Thanks [@WBbug](https://github.com/WBbug)! - change selection type, add range type

*   [#238](https://github.com/worktile/plait/pull/238) [`4c95c47`](https://github.com/worktile/plait/commit/4c95c47acc20c788e60cb2bd4d80b474527202a6) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support active render

-   [#240](https://github.com/worktile/plait/pull/240) [`fcd2a08`](https://github.com/worktile/plait/commit/fcd2a084305f8f3582df5bc6d088be2a8e3f3ef0) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support edge text and edge marker render

*   [#236](https://github.com/worktile/plait/pull/236) [`6b2ab59`](https://github.com/worktile/plait/commit/6b2ab59fa74484cbca995951e24eb6722f77d664) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - init flow plugin

-   [#254](https://github.com/worktile/plait/pull/254) [`1256c09`](https://github.com/worktile/plait/commit/1256c0999c7d9695bc266c6c9d42a8810c1ad1df) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support edge drag

*   [#267](https://github.com/worktile/plait/pull/267) [`c843502`](https://github.com/worktile/plait/commit/c84350267f6e593011f83874ec87961da72961a1) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - set selection when mousedown and mousemove

-   [#247](https://github.com/worktile/plait/pull/247) [`51bc0c8`](https://github.com/worktile/plait/commit/51bc0c81067a0ea92d02063fef8ca170d4706273) Thanks [@WBbug](https://github.com/WBbug)! - change getWidthByText to getSizeByText, separate buildNodes and buildMindmap function
