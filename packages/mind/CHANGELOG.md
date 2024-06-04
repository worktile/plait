# mind

## 0.60.0

### Patch Changes

-   [#902](https://github.com/worktile/plait/pull/902) [`22d2431ff`](https://github.com/worktile/plait/commit/22d2431fff54a84177c815c61c8bbe5bb28ae123) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - set user-select to text paragraph instead of event.preventDefault

## 0.59.0

## 0.58.0

## 0.57.0

## 0.56.2

## 0.56.1

### Patch Changes

-   [`d67c34517`](https://github.com/worktile/plait/commit/d67c345172391eaf477928950e423a363045641d) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add operation type for setFragment

## 0.56.0

### Minor Changes

-   [#851](https://github.com/worktile/plait/pull/851) [`f854a648`](https://github.com/worktile/plait/commit/f854a648867742a1e6dab7d6387e96601e8baa11) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support alt key duplicate

*   [#845](https://github.com/worktile/plait/pull/845) [`d873bc39`](https://github.com/worktile/plait/commit/d873bc391dbfc9cc56a912a986f81399a7182b9b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - try to remove ELEMENT_TO_COMPONENT and getComponent

    add NODE_TO_CONTAINER_G、NODE_TO_G to store element and g's connection

    add ELEMENT_TO_REF to store element and other element-instance's connection

    remove the code that invoke getComponent in core、common、mind、draw

### Patch Changes

-   [`1c56b92d`](https://github.com/worktile/plait/commit/1c56b92d1232fe69cb6d3678925efe5436005ddb) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix element can not be selected after creating

    [mind]: fix console error after creating

## 0.55.1

## 0.55.0

### Minor Changes

-   [#823](https://github.com/worktile/plait/pull/823) [`1159be17`](https://github.com/worktile/plait/commit/1159be17cd3acd0511e20625075afff52a24de45) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support moveToTop and moveToBottom

*   [#828](https://github.com/worktile/plait/pull/828) [`2b083781`](https://github.com/worktile/plait/commit/2b083781c5264c0d30f81f43346ce73de77d06d5) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - rename setFragment to buildFragment

    remove DataTransfer param of setFragment and insertFragment

    support duplicate elements

### Patch Changes

-   [#836](https://github.com/worktile/plait/pull/836) [`93306068`](https://github.com/worktile/plait/commit/9330606820cb2374224a4f2fc1a29e5f2edcd80c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent pointerDown from invoking when mind is creating, fix getNode error before mind having been initialized

    add hasMounted method to get element mounted state, fix getElementG error after element had been deleted

## 0.54.0

## 0.53.0

### Minor Changes

-   [#781](https://github.com/worktile/plait/pull/781) [`88140782`](https://github.com/worktile/plait/commit/881407821ab449553b438d33e2db216121414ba7) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add canAddToGroup for board
    support mindmap group

*   [#783](https://github.com/worktile/plait/pull/783) [`09b2f382`](https://github.com/worktile/plait/commit/09b2f382723d21bcb1e1f7ea4b11833355d66716) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - export GroupTransforms and support group hotkey

## 0.51.4

## 0.52.0

### Minor Changes

-   [`6b6678df`](https://github.com/worktile/plait/commit/6b6678dfd65d9cfe1b80726afdd9ef4044d9202a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - bump angular into v17

## 0.52.0-next.0

### Minor Changes

-   [`6b6678df`](https://github.com/worktile/plait/commit/6b6678dfd65d9cfe1b80726afdd9ef4044d9202a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - bump angular into v17

## 0.51.3

## 0.51.2

## 0.51.1

## 0.51.0

### Minor Changes

-   [#742](https://github.com/worktile/plait/pull/742) [`1c3cfa4d`](https://github.com/worktile/plait/commit/1c3cfa4d35c9d7b1d1c2c553546a81337e89bdfc) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - throttleRAF support set key and board to avoid the effect of multiple scene call

### Patch Changes

-   [`d685e28b`](https://github.com/worktile/plait/commit/d685e28b55a91b4ef648951ec633f1ef2d22171e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move image focus logic to pointerUp to resolve image focus issue which can not prevent mind element selected

## 0.50.1

### Patch Changes

-   [#702](https://github.com/worktile/plait/pull/702) [`aff5f597`](https://github.com/worktile/plait/commit/aff5f597156f562962bf42557256ef295d2328e3) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - compat firefox contextmenu copy and fix mind image copy

## 0.50.0

### Minor Changes

-   [#699](https://github.com/worktile/plait/pull/699) [`5c2f3d28`](https://github.com/worktile/plait/commit/5c2f3d28fc7a147606d101a6a2e9c44df55a7780) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove x-plait-fragment key and use text/html as standard key

### Patch Changes

-   [#701](https://github.com/worktile/plait/pull/701) [`18790e12`](https://github.com/worktile/plait/commit/18790e1272dffe80366927c19d334837ebc34b51) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add getElementsText

*   [#701](https://github.com/worktile/plait/pull/701) [`18790e12`](https://github.com/worktile/plait/commit/18790e1272dffe80366927c19d334837ebc34b51) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - refactor: uniformly handle clipboard data and add parameter for setFragment and insertFragment

## 0.49.0

### Minor Changes

-   [`d0834d52`](https://github.com/worktile/plait/commit/d0834d5212fcf9c7228b88718f0695721f18d3ef) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - setFontSize support argument defaultFontSize as number and method

*   [`3205b2a4`](https://github.com/worktile/plait/commit/3205b2a4991b50244a2fd15edc7fa51e58443ead) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - export mind transforms function

-   [`8250c28a`](https://github.com/worktile/plait/commit/8250c28a0580eb06a7a1a297871df263869167fa) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - extract to-point to handle coordinate transform

## 0.48.0

## 0.47.0

### Minor Changes

-   [`85562abc`](https://github.com/worktile/plait/commit/85562abc2af58991c1ce50a2e140a4f72ef02942) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - skip 0.46.0

## 0.46.0

### Patch Changes

-   [`7aee1f95`](https://github.com/worktile/plait/commit/7aee1f9598199840d00aaac3d96b20d2ac5fb192) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support prepend option in GeneratorOptions, and set prepend to true in node shape generator

## 0.45.0

### Minor Changes

-   [`1f7f90a5`](https://github.com/worktile/plait/commit/1f7f90a52eb5f9a2bf550b10f1af3a2efee2ec76) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getFirstTextManage and getFirstTextEditor, remove get textManage and getEditor in mind element and geometry element

## 0.44.0

## 0.43.0

## 0.42.0

## 0.41.0

### Patch Changes

-   [#686](https://github.com/worktile/plait/pull/686) [`b58d09b7`](https://github.com/worktile/plait/commit/b58d09b7f6ae2aa7729c6e9035a1a52d0467c8cd) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add insertChildNode and insertSiblingNode

## 0.40.0

### Minor Changes

-   [`025bd41b`](https://github.com/worktile/plait/commit/025bd41b8ef3656fb1ff19f008cf01760914294b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor mind node resize, use basic with resize in common

## 0.39.0

## 0.38.0

## 0.37.0

### Minor Changes

-   [`2ca2c657`](https://github.com/worktile/plait/commit/2ca2c65710c278d3199ef62be45fef779ad17121) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move drawEmoji hook to options
    solve align and distribute line can not show

## 0.36.0

### Minor Changes

-   [#663](https://github.com/worktile/plait/pull/663) [`5db82bd0`](https://github.com/worktile/plait/commit/5db82bd0c196b3311d742a2ffb9c92800468f359) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move cursor class enum to core
    improve line auto complete reaction

*   [`d8a765c3`](https://github.com/worktile/plait/commit/d8a765c33f44f5df6fd9dbf0b88f8d0a48368204) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add readonly condition before edit board

-   [#658](https://github.com/worktile/plait/pull/658) [`a8fe6593`](https://github.com/worktile/plait/commit/a8fe65932fa5e499223a83fd4a74cf6a480a0953) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move active g to element active host
    replace mouse event with pointer event in with-abstract-resize

## 0.35.0

## 0.34.0

### Minor Changes

-   [#650](https://github.com/worktile/plait/pull/650) [`930a284a`](https://github.com/worktile/plait/commit/930a284a598748a5f41f21f690fd6d82600c0079) Thanks [@WBbug](https://github.com/WBbug)! - add transform

## 0.33.0

### Minor Changes

-   [#636](https://github.com/worktile/plait/pull/636) [`6c2a693b`](https://github.com/worktile/plait/commit/6c2a693b75c6637067e624f1386bb1da43d219c2) Thanks [@WBbug](https://github.com/WBbug)! - support auto complete

*   [#637](https://github.com/worktile/plait/pull/637) [`8d31241b`](https://github.com/worktile/plait/commit/8d31241b945c6b4362e9d057aaf52c2b420ad394) Thanks [@WBbug](https://github.com/WBbug)! - support change geometry style when change theme

-   [`385eebb2`](https://github.com/worktile/plait/commit/385eebb2601f718dcf9c4d3806c3d3ad34384a13) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update generator function name

*   [`a4864124`](https://github.com/worktile/plait/commit/a4864124d47e7b3f8811f4ec7b26e2f3f331e216) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename drawer to generator

### Patch Changes

-   [`9f5aa5eb`](https://github.com/worktile/plait/commit/9f5aa5eb238f55070fb8dffe4af1a1fe3fd4131e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix mind collapsed/expand can not show issue

*   [`fff12077`](https://github.com/worktile/plait/commit/fff120778974307456176ed2f6e72c85fa7aaedb) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modified setProperty position and function's arguments

## 0.32.0

### Minor Changes

-   [#634](https://github.com/worktile/plait/pull/634) [`c096f853`](https://github.com/worktile/plait/commit/c096f8538a72eb7daab8821c7784f4de3d9f7e9d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent text from being selected when user pressed shift and pointer down

*   [#634](https://github.com/worktile/plait/pull/634) [`8bf33508`](https://github.com/worktile/plait/commit/8bf33508a704e26c37436c453f14882aa5112953) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove selected element if include

-   [#634](https://github.com/worktile/plait/pull/634) [`3d9ae405`](https://github.com/worktile/plait/commit/3d9ae4057a3d0bfb617a23ea302c50b3cbe42c3f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add user-select: node in firefox browser

## 0.31.0

### Minor Changes

-   [#627](https://github.com/worktile/plait/pull/627) [`dfb55270`](https://github.com/worktile/plait/commit/dfb552706df93ba6797004c4746fb1aff3e45924) Thanks [@WBbug](https://github.com/WBbug)! - support resize by moving border

*   [`a929b1e5`](https://github.com/worktile/plait/commit/a929b1e577c25811e33e77587c583c1773e18916) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct image hit logic and handle fill equals transparent issue

### Patch Changes

-   [`01f88efa`](https://github.com/worktile/plait/commit/01f88efa024ba3fd5b0d3e0ef229b16ed519614e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - hide mind node expand when resizing or creation mode

## 0.30.0

### Minor Changes

-   [`8eae35a8`](https://github.com/worktile/plait/commit/8eae35a8440b00f29d9349a8ad6ea87ae4cb01ce) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename isHitSelection to isRectangleHit

*   [`0589514b`](https://github.com/worktile/plait/commit/0589514ba6ddadf6afa735ee66b02501fbcaca9a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - resolve inflict between with-moving and with node dnd of mind

-   [`882c5e1e`](https://github.com/worktile/plait/commit/882c5e1e247d5411c9f8f7527acad910301a479b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move cached element of focused image to common
    add override function isImageBindingAllowed

*   [#624](https://github.com/worktile/plait/pull/624) [`51591399`](https://github.com/worktile/plait/commit/515913995e35f9567c1125c18fcb427b9d8817db) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove range interface and remove ranges from selection

-   [`09c7083a`](https://github.com/worktile/plait/commit/09c7083af9f52ee6b6bef70dad99c68da4ad1e3e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add overridable function isHit

*   [#624](https://github.com/worktile/plait/pull/624) [`51591399`](https://github.com/worktile/plait/commit/515913995e35f9567c1125c18fcb427b9d8817db) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - use isHit and isRectangle to distinguish hit solid element or hit rectangle area of element

### Patch Changes

-   [#622](https://github.com/worktile/plait/pull/622) [`721de831`](https://github.com/worktile/plait/commit/721de83186987f873a52027767279787783394ef) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add class when set abstract node active

## 0.29.0

### Minor Changes

-   [`47584f1c`](https://github.com/worktile/plait/commit/47584f1c8979422273b4cd9878e1f61c2223e94e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent mind node dnd when press up element

## 0.28.0

### Minor Changes

-   release 0.28.0

## 0.27.0

### Minor Changes

-   [`28df0eeb`](https://github.com/worktile/plait/commit/28df0eeb4ee60ba4b66609a16b6dea2ab82e0242) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove max-with property in css, use single rectangle to limit text's width

*   [`653109b8`](https://github.com/worktile/plait/commit/653109b836c5707ec03714a801e3a167ad4e6263) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle touch target to avoid touch move event not fire

-   [#532](https://github.com/worktile/plait/pull/532) [`a7dfd850`](https://github.com/worktile/plait/commit/a7dfd850732c43f99aaff4e336bcda16768b93c0) Thanks [@WBbug](https://github.com/WBbug)! - support keyDown edit text

*   [`b8c9d871`](https://github.com/worktile/plait/commit/b8c9d8718f02af6a15161b044ba7cc6c6a6990a9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - do not show resize handle for geometry when isSelectionMoving is true
    do not show resize handle for geometry text when text is editing

-   [`5e4c5d25`](https://github.com/worktile/plait/commit/5e4c5d25a3797e9f77d9efad2b6ad7016fa59b11) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve geometry drawing style

*   [`3f8d541a`](https://github.com/worktile/plait/commit/3f8d541a6b7fa2257e42ce9048f9e4eff8f255e4) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - select elements which were inserted from clipboard

-   [#521](https://github.com/worktile/plait/pull/521) [`ddb416f4`](https://github.com/worktile/plait/commit/ddb416f4ad33b53cbed7d6257b834c3b2108b688) Thanks [@WBbug](https://github.com/WBbug)! - support wrap line when has autoSize

*   [#582](https://github.com/worktile/plait/pull/582) [`32a40c6c`](https://github.com/worktile/plait/commit/32a40c6c1d7d9821bbd2616194794e8e7572f6af) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve mind node shape logic

-   [`85cc74b4`](https://github.com/worktile/plait/commit/85cc74b4998c5fef49fe9b06dd332f97e0742049) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove topic width buffer (4) to avoid mind node align issue

*   [`35bd204d`](https://github.com/worktile/plait/commit/35bd204d14045988163b9de7f3ad6ff0dabeed4a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename utils to common
    rename drawer to generator
    geometry support moving and active state

-   [#601](https://github.com/worktile/plait/pull/601) [`ddd009c8`](https://github.com/worktile/plait/commit/ddd009c857c319b9680bf0395c7a490ac1f10ab2) Thanks [@WBbug](https://github.com/WBbug)! - support image

*   [`d8a77123`](https://github.com/worktile/plait/commit/d8a771232a4fc8539abc2408646b55834af2b00c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - draw line support resize

-   [#565](https://github.com/worktile/plait/pull/565) [`4591b267`](https://github.com/worktile/plait/commit/4591b267647a9b9d959c384b2e45cf796d75687a) Thanks [@WBbug](https://github.com/WBbug)! - change mind creation

*   [`2300b4f7`](https://github.com/worktile/plait/commit/2300b4f7853b033df85a7e01b837a810bb5453ec) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add override function getDeletedFragment and handle deleted element by the return result of getDeletedFragment

-   [`42cdd3bd`](https://github.com/worktile/plait/commit/42cdd3bd692712c6a117b780a135fff863e4abed) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support draw-element copy and paste

*   [`f2b506ee`](https://github.com/worktile/plait/commit/f2b506ee18e614b9a5087ae64dd0188b5f80439c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - setFragment support type property
    handle bound geometry element for line element

-   [`aedbae54`](https://github.com/worktile/plait/commit/aedbae5464735592f7682335c14cf1e733b9e46d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update geometry stroke width generate logic

*   [#582](https://github.com/worktile/plait/pull/582) [`8f98117d`](https://github.com/worktile/plait/commit/8f98117db94761789bd9c4a97b4b560aa242a69e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove the effect about stroke width in layout options

-   [#524](https://github.com/worktile/plait/pull/524) [`70c430c0`](https://github.com/worktile/plait/commit/70c430c0f2fe43a27fb60b8c1e3063d97095e8b3) Thanks [@WBbug](https://github.com/WBbug)! - set cursor style

*   [#589](https://github.com/worktile/plait/pull/589) [`1af013ed`](https://github.com/worktile/plait/commit/1af013edf83f5499314ead60424eaab23fb1764e) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support standalone component

-   [#526](https://github.com/worktile/plait/pull/526) [`9b2cc192`](https://github.com/worktile/plait/commit/9b2cc192c0dca93aedb51b489f6d11e98e1ba6d5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add common with resize and common active generator

*   [#582](https://github.com/worktile/plait/pull/582) [`1202b198`](https://github.com/worktile/plait/commit/1202b19843dd3e6a3ae807457154f8382c7c7c7d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve mind node active generator

-   [`06a3a57d`](https://github.com/worktile/plait/commit/06a3a57deac23520b9a0b535e27ca7aaf1f0ef8b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - `draw`: support draw elements delete
    `core`: invoke deleteFragment when use press delete or backspace

### Patch Changes

-   [`ad7e641c`](https://github.com/worktile/plait/commit/ad7e641c625e595f715350ac8b44e80e14f2d826) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update textHeight when resize geometry

*   [#533](https://github.com/worktile/plait/pull/533) [`d369c911`](https://github.com/worktile/plait/commit/d369c911ab4a12db8df43a5202d25973598b13bd) Thanks [@WBbug](https://github.com/WBbug)! - change hotkey judge condition

-   [`06521543`](https://github.com/worktile/plait/commit/065215431516fce35a47919fff1f9caeece38491) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - assign multiple active stroke opacity 0.5
    correct isMoving condition for line

*   [#605](https://github.com/worktile/plait/pull/605) [`ebb02083`](https://github.com/worktile/plait/commit/ebb02083e75124e74485d399d7258125cdb818bb) Thanks [@WBbug](https://github.com/WBbug)! - add isAlign

-   [`f0a54854`](https://github.com/worktile/plait/commit/f0a54854876424f5dc2881a4125a6e2aea423f48) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - destroy active as mind node image delete

*   [#591](https://github.com/worktile/plait/pull/591) [`60c8f847`](https://github.com/worktile/plait/commit/60c8f847600edf90cc0a510b17a8f39dd765be4c) Thanks [@WBbug](https://github.com/WBbug)! - fix mind point

-   [#568](https://github.com/worktile/plait/pull/568) [`5303802b`](https://github.com/worktile/plait/commit/5303802b50396165663db5b72d82fd720ac89b00) Thanks [@WBbug](https://github.com/WBbug)! - add WithTextPluginKey in common

*   [#604](https://github.com/worktile/plait/pull/604) [`fae69f43`](https://github.com/worktile/plait/commit/fae69f43fef59b723d89e39d89fcdb0f0b756011) Thanks [@WBbug](https://github.com/WBbug)! - fix mind image

-   [`ec9c4216`](https://github.com/worktile/plait/commit/ec9c4216a40ff531a96b453a3a9f386170e0a97d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix alignment property display in editing

*   [`b603a38b`](https://github.com/worktile/plait/commit/b603a38b1e7810544d486153f472dcaac9dbec21) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent select mind node when select emoji

## 0.27.0-next.10

### Minor Changes

-   [#601](https://github.com/worktile/plait/pull/601) [`ddd009c8`](https://github.com/worktile/plait/commit/ddd009c857c319b9680bf0395c7a490ac1f10ab2) Thanks [@WBbug](https://github.com/WBbug)! - support image

*   [#589](https://github.com/worktile/plait/pull/589) [`1af013ed`](https://github.com/worktile/plait/commit/1af013edf83f5499314ead60424eaab23fb1764e) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support standalone component

### Patch Changes

-   [#605](https://github.com/worktile/plait/pull/605) [`ebb02083`](https://github.com/worktile/plait/commit/ebb02083e75124e74485d399d7258125cdb818bb) Thanks [@WBbug](https://github.com/WBbug)! - add isAlign

*   [#604](https://github.com/worktile/plait/pull/604) [`fae69f43`](https://github.com/worktile/plait/commit/fae69f43fef59b723d89e39d89fcdb0f0b756011) Thanks [@WBbug](https://github.com/WBbug)! - fix mind image

## 0.27.0-next.9

### Patch Changes

-   [#591](https://github.com/worktile/plait/pull/591) [`60c8f847`](https://github.com/worktile/plait/commit/60c8f847600edf90cc0a510b17a8f39dd765be4c) Thanks [@WBbug](https://github.com/WBbug)! - fix mind point

## 0.27.0-next.8

### Minor Changes

-   [`3f8d541a`](https://github.com/worktile/plait/commit/3f8d541a6b7fa2257e42ce9048f9e4eff8f255e4) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - select elements which were inserted from clipboard

*   [#582](https://github.com/worktile/plait/pull/582) [`32a40c6c`](https://github.com/worktile/plait/commit/32a40c6c1d7d9821bbd2616194794e8e7572f6af) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve mind node shape logic

-   [`f2b506ee`](https://github.com/worktile/plait/commit/f2b506ee18e614b9a5087ae64dd0188b5f80439c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - setFragment support type property
    handle bound geometry element for line element

*   [#582](https://github.com/worktile/plait/pull/582) [`8f98117d`](https://github.com/worktile/plait/commit/8f98117db94761789bd9c4a97b4b560aa242a69e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove the effect about stroke width in layout options

-   [#582](https://github.com/worktile/plait/pull/582) [`1202b198`](https://github.com/worktile/plait/commit/1202b19843dd3e6a3ae807457154f8382c7c7c7d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve mind node active generator

## 0.27.0-next.7

### Patch Changes

-   [`06521543`](https://github.com/worktile/plait/commit/065215431516fce35a47919fff1f9caeece38491) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - assign multiple active stroke opacity 0.5
    correct isMoving condition for line

## 0.27.0-next.6

### Minor Changes

-   [`653109b8`](https://github.com/worktile/plait/commit/653109b836c5707ec03714a801e3a167ad4e6263) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle touch target to avoid touch move event not fire

*   [`aedbae54`](https://github.com/worktile/plait/commit/aedbae5464735592f7682335c14cf1e733b9e46d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update geometry stroke width generate logic

## 0.27.0-next.5

### Minor Changes

-   [`2300b4f7`](https://github.com/worktile/plait/commit/2300b4f7853b033df85a7e01b837a810bb5453ec) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add override function getDeletedFragment and handle deleted element by the return result of getDeletedFragment

### Patch Changes

-   [#568](https://github.com/worktile/plait/pull/568) [`5303802b`](https://github.com/worktile/plait/commit/5303802b50396165663db5b72d82fd720ac89b00) Thanks [@WBbug](https://github.com/WBbug)! - add WithTextPluginKey in common

## 0.27.0-next.4

### Minor Changes

-   [`28df0eeb`](https://github.com/worktile/plait/commit/28df0eeb4ee60ba4b66609a16b6dea2ab82e0242) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove max-with property in css, use single rectangle to limit text's width

*   [`85cc74b4`](https://github.com/worktile/plait/commit/85cc74b4998c5fef49fe9b06dd332f97e0742049) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove topic width buffer (4) to avoid mind node align issue

### Patch Changes

-   [`b603a38b`](https://github.com/worktile/plait/commit/b603a38b1e7810544d486153f472dcaac9dbec21) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent select mind node when select emoji

## 0.27.0-next.3

### Minor Changes

-   [`5e4c5d25`](https://github.com/worktile/plait/commit/5e4c5d25a3797e9f77d9efad2b6ad7016fa59b11) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve geometry drawing style

*   [#565](https://github.com/worktile/plait/pull/565) [`4591b267`](https://github.com/worktile/plait/commit/4591b267647a9b9d959c384b2e45cf796d75687a) Thanks [@WBbug](https://github.com/WBbug)! - change mind creation

## 0.27.0-next.2

### Minor Changes

-   [`b8c9d871`](https://github.com/worktile/plait/commit/b8c9d8718f02af6a15161b044ba7cc6c6a6990a9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - do not show resize handle for geometry when isSelectionMoving is true
    do not show resize handle for geometry text when text is editing

### Patch Changes

-   [`ad7e641c`](https://github.com/worktile/plait/commit/ad7e641c625e595f715350ac8b44e80e14f2d826) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update textHeight when resize geometry

*   [`ec9c4216`](https://github.com/worktile/plait/commit/ec9c4216a40ff531a96b453a3a9f386170e0a97d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix alignment property display in editing

## 0.27.0-next.1

### Minor Changes

-   [#532](https://github.com/worktile/plait/pull/532) [`a7dfd850`](https://github.com/worktile/plait/commit/a7dfd850732c43f99aaff4e336bcda16768b93c0) Thanks [@WBbug](https://github.com/WBbug)! - support keyDown edit text

*   [`d8a77123`](https://github.com/worktile/plait/commit/d8a771232a4fc8539abc2408646b55834af2b00c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - draw line support resize

### Patch Changes

-   [#533](https://github.com/worktile/plait/pull/533) [`d369c911`](https://github.com/worktile/plait/commit/d369c911ab4a12db8df43a5202d25973598b13bd) Thanks [@WBbug](https://github.com/WBbug)! - change hotkey judge condition

*   [`f0a54854`](https://github.com/worktile/plait/commit/f0a54854876424f5dc2881a4125a6e2aea423f48) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - destroy active as mind node image delete

## 0.27.0-next.0

### Minor Changes

-   [#521](https://github.com/worktile/plait/pull/521) [`ddb416f4`](https://github.com/worktile/plait/commit/ddb416f4ad33b53cbed7d6257b834c3b2108b688) Thanks [@WBbug](https://github.com/WBbug)! - support wrap line when has autoSize

*   [`35bd204d`](https://github.com/worktile/plait/commit/35bd204d14045988163b9de7f3ad6ff0dabeed4a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename utils to common
    rename drawer to generator
    geometry support moving and active state

-   [`42cdd3bd`](https://github.com/worktile/plait/commit/42cdd3bd692712c6a117b780a135fff863e4abed) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support draw-element copy and paste

*   [#524](https://github.com/worktile/plait/pull/524) [`70c430c0`](https://github.com/worktile/plait/commit/70c430c0f2fe43a27fb60b8c1e3063d97095e8b3) Thanks [@WBbug](https://github.com/WBbug)! - set cursor style

-   [#526](https://github.com/worktile/plait/pull/526) [`9b2cc192`](https://github.com/worktile/plait/commit/9b2cc192c0dca93aedb51b489f6d11e98e1ba6d5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add common with resize and common active generator

*   [`06a3a57d`](https://github.com/worktile/plait/commit/06a3a57deac23520b9a0b535e27ca7aaf1f0ef8b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - `draw`: support draw elements delete
    `core`: invoke deleteFragment when use press delete or backspace

## 0.26.0

### Minor Changes

-   [`eed884fb`](https://github.com/worktile/plait/commit/eed884fbde6aaa48b103d23a1bfc13a89b310e53) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move preventDefault from mouse down to mouse move

## 0.25.0

### Minor Changes

-   [#509](https://github.com/worktile/plait/pull/509) [`1231d720`](https://github.com/worktile/plait/commit/1231d720caa5ee2f1f4d3e798f2e413952104bff) Thanks [@WBbug](https://github.com/WBbug)! - support deleteFragment and setFragment in image

### Patch Changes

-   [`af0f37f4`](https://github.com/worktile/plait/commit/af0f37f4990b4bc88da0cf36c822c61aff7218d1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix mind node image style in safari
    add browser class on board native element

## 0.24.1

### Patch Changes

-   [#508](https://github.com/worktile/plait/pull/508) [`efef613a`](https://github.com/worktile/plait/commit/efef613a457ffa45abde2af34bc742f648d1c469) Thanks [@WBbug](https://github.com/WBbug)! - exit editing when not click in text

*   [`0c1475c7`](https://github.com/worktile/plait/commit/0c1475c7c3f785ed42150326be377831157329a0) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - solve height equals newHeight, but newHeight can not match element-height
    update text max-width when image width greater than topic default max width to cover node topic default max width style

## 0.24.0

### Minor Changes

-   [#505](https://github.com/worktile/plait/pull/505) [`70035fcb`](https://github.com/worktile/plait/commit/70035fcbf6ef60b68248b6acc8a7b3b19db93772) Thanks [@WBbug](https://github.com/WBbug)! - add PlaitContextService in core, add image functions in mind

*   [`0f59ab0c`](https://github.com/worktile/plait/commit/0f59ab0c47f73d04fc0e6a58e19776cff7b66adf) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getNewNodeHeight to calculate the new height of topic when user upload node image or resize image
    set node new height when remove node image

### Patch Changes

-   [#500](https://github.com/worktile/plait/pull/500) [`6ea3fce0`](https://github.com/worktile/plait/commit/6ea3fce0129ff4a8cffbacaa4b0bea66b40f3e80) Thanks [@WBbug](https://github.com/WBbug)! - clear selection when select emoji and image

*   [#506](https://github.com/worktile/plait/pull/506) [`113854cb`](https://github.com/worktile/plait/commit/113854cb859c21612dc179fbd6f0445f204f825e) Thanks [@WBbug](https://github.com/WBbug)! - fix can't remove emoji when is one emoji

-   [#502](https://github.com/worktile/plait/pull/502) [`4eea2149`](https://github.com/worktile/plait/commit/4eea21491cde9799fdaeeae4540253ebf39aae11) Thanks [@WBbug](https://github.com/WBbug)! - fix lose image when dnd

*   [#507](https://github.com/worktile/plait/pull/507) [`dbfb2af2`](https://github.com/worktile/plait/commit/dbfb2af268554e25b83456f8bdbb94130f2b4beb) Thanks [@WBbug](https://github.com/WBbug)! - move ImageEntry to core

-   [#499](https://github.com/worktile/plait/pull/499) [`d25486fc`](https://github.com/worktile/plait/commit/d25486fcbf34866fdf7a2f3051d5883e93749c93) Thanks [@WBbug](https://github.com/WBbug)! - add afterImageItemChange in MindImageBaseComponent

## 0.23.1

### Patch Changes

-   [`7882dd54`](https://github.com/worktile/plait/commit/7882dd543bfaf3ae3972b66f88677027a1bd2d86) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support width style when getTextSize

*   [#497](https://github.com/worktile/plait/pull/497) [`8fe4af7d`](https://github.com/worktile/plait/commit/8fe4af7d5885afc976260d587f106d87aceba0c8) Thanks [@WBbug](https://github.com/WBbug)! - set unFocus when remove Image

-   [`75ba9a04`](https://github.com/worktile/plait/commit/75ba9a043ea9bd4891acc57fda2cf833063d3b55) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - initialize max width when first draw topic

*   [#494](https://github.com/worktile/plait/pull/494) [`936056b3`](https://github.com/worktile/plait/commit/936056b37f1d6871a563afeafc3f779c0b68cdaa) Thanks [@WBbug](https://github.com/WBbug)! - fix delete image when set emoji

## 0.23.0

### Minor Changes

-   [#493](https://github.com/worktile/plait/pull/493) [`a31c6172`](https://github.com/worktile/plait/commit/a31c6172446eee6bc8115faa2b466b39e514804d) Thanks [@WBbug](https://github.com/WBbug)! - let cursor zoom-in when readonly

### Patch Changes

-   [`bc0c2108`](https://github.com/worktile/plait/commit/bc0c2108eae03a2c3d25090ce99896be91dd51b1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle zoom issue in node resize

*   [#492](https://github.com/worktile/plait/pull/492) [`e066e28e`](https://github.com/worktile/plait/commit/e066e28e28466f745f8d3ce1da24d7c690965af5) Thanks [@WBbug](https://github.com/WBbug)! - set abstract select after create

## 0.22.0

### Minor Changes

-   [#491](https://github.com/worktile/plait/pull/491) [`540995b3`](https://github.com/worktile/plait/commit/540995b3bdd5677a674e96d2f529afb11d2b4924) Thanks [@WBbug](https://github.com/WBbug)! - clear imageFocus when click outside

*   [#490](https://github.com/worktile/plait/pull/490) [`4898f7c7`](https://github.com/worktile/plait/commit/4898f7c7d891c182e3b1494fac4b3b833cec6dc9) Thanks [@WBbug](https://github.com/WBbug)! - set selected when delete image

### Patch Changes

-   [`b69b171a`](https://github.com/worktile/plait/commit/b69b171a6eb3805d66377f6c033e3006714385ae) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add throttleRAF at handle resizing

## 0.21.0

### Minor Changes

-   [#486](https://github.com/worktile/plait/pull/486) [`a94a9fd6`](https://github.com/worktile/plait/commit/a94a9fd6f50b2334de08004f10ef1a08c27f918d) Thanks [@WBbug](https://github.com/WBbug)! - add strokeWidth when calculate node shape

*   [#489](https://github.com/worktile/plait/pull/489) [`6f0e1190`](https://github.com/worktile/plait/commit/6f0e1190836c9c2f263f19b86cbb734025a34fbf) Thanks [@WBbug](https://github.com/WBbug)! - set image middle when element wider

-   [#484](https://github.com/worktile/plait/pull/484) [`3e4b45d3`](https://github.com/worktile/plait/commit/3e4b45d31649bfbaaad38d56121e02a81189499b) Thanks [@WBbug](https://github.com/WBbug)! - don't destroy component when updateImage

*   [`f7f0267c`](https://github.com/worktile/plait/commit/f7f0267cf216bd30898a217ee3fc75b44dfbc28e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add mind node resize plugin

-   [#483](https://github.com/worktile/plait/pull/483) [`f5718341`](https://github.com/worktile/plait/commit/f57183414f257d43c8238d6e991f6574e9830579) Thanks [@WBbug](https://github.com/WBbug)! - add isFocus in MindImageBaseComponent

*   [#485](https://github.com/worktile/plait/pull/485) [`c76eb32f`](https://github.com/worktile/plait/commit/c76eb32f1c4d7270d99848b6fc9494f90bf7de31) Thanks [@WBbug](https://github.com/WBbug)! - set focus false when has selectedImageElement

-   [`e88eb2cc`](https://github.com/worktile/plait/commit/e88eb2cca2ec537e9f8fc9eed9571f6fce1f9613) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent text from being selected when the user presses main pointer and is moving
    it is decided by plugin layer whether to allow the user to select text when they press the main pointer on text element

*   [#488](https://github.com/worktile/plait/pull/488) [`b9e10fba`](https://github.com/worktile/plait/commit/b9e10fba8862438a5fa32b64ce841189b0e4c984) Thanks [@WBbug](https://github.com/WBbug)! - change update image foreignObject logic, add BOARD_TO_SELECTED_IMAGE_ELEMENT

### Patch Changes

-   [`49c99536`](https://github.com/worktile/plait/commit/49c9953672e10fdbd6a277a85d0cbb4e404399eb) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct mind node topic width logic

## 0.20.0

### Minor Changes

-   [`c5a99a28`](https://github.com/worktile/plait/commit/c5a99a2853df65697672e54d9f29e461e3669f33) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modify mind-node min width, use based-font-size min width
    add getNodeResizableWidth, getNodeResizableMinWidth, getNodeTopicMinWidth in node-space

*   [`f0806da1`](https://github.com/worktile/plait/commit/f0806da12559a5e7757d5c4696d91c58c4df7dc4) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getIsRecursionFunc

## 0.19.0

### Minor Changes

-   [`f9816b72`](https://github.com/worktile/plait/commit/f9816b72cf31950e2a9c9a8e1624f51d002ecde6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - extract getFillByElement to get node fill color

## 0.18.0

### Minor Changes

-   [#477](https://github.com/worktile/plait/pull/477) [`55a852c8`](https://github.com/worktile/plait/commit/55a852c87e2b87cf0331570e8c7bdcd66df57f37) Thanks [@WBbug](https://github.com/WBbug)! - delete active fill

*   [`164997a1`](https://github.com/worktile/plait/commit/164997a1ad4c1ff3dee7fb2413864cb49c00f529) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - draw active mind-node by stroke width
    remove abstract handle in applyTheme

### Patch Changes

-   [`2e18752c`](https://github.com/worktile/plait/commit/2e18752cc8ddd3b0d7168a3560302dfd561cc4a6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modify mind node rectangle-shape radius

*   [`0a5df364`](https://github.com/worktile/plait/commit/0a5df364cae210122ecd00c3f7e0b0e99f795c64) Thanks [@WBbug](https://github.com/WBbug)! - fix get wrong shape

## 0.17.0

### Minor Changes

-   [`ffd11bdd`](https://github.com/worktile/plait/commit/ffd11bdd8728201a9d397cd26de558c631c665f1) Thanks [@WBbug](https://github.com/WBbug)! - support select image and delete

*   [`73bad8f3`](https://github.com/worktile/plait/commit/73bad8f33f65308396986f3bea6b061f562204c2) Thanks [@WBbug](https://github.com/WBbug)! - support add image

### Patch Changes

-   [`ce6596f8`](https://github.com/worktile/plait/commit/ce6596f876491ab10c989104e7e73dbb42e38177) Thanks [@WBbug](https://github.com/WBbug)! - get topic string

*   [`4bd573d2`](https://github.com/worktile/plait/commit/4bd573d2a026dff52b9069901956151a865fcd4f) Thanks [@WBbug](https://github.com/WBbug)! - change link style, draw image when dnd

## 0.16.0

### Minor Changes

-   [`682ec260`](https://github.com/worktile/plait/commit/682ec2602e66811669d18b77f0f2ef7e38eab5f2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle text exit when the node that was editing was deleted

*   [`5c2db482`](https://github.com/worktile/plait/commit/5c2db4827d21cd9a2a5a4de278b40f263adfda05) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove special option entry in mind and use plait option

-   [`d69471eb`](https://github.com/worktile/plait/commit/d69471eb187d15bdda129d338ef9a760ccdbfc8d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor get next selected element logic

*   [`fadc6ad4`](https://github.com/worktile/plait/commit/fadc6ad42dc5d994f1d64701a9c9e9788a91967f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add isChildOfAbstract function
    add default branch color and stroke for the abstract node and the children of abstract node

### Patch Changes

-   [#465](https://github.com/worktile/plait/pull/465) [`6631fc5c`](https://github.com/worktile/plait/commit/6631fc5c90e6bdf75c888c47273099d9a9260282) Thanks [@WBbug](https://github.com/WBbug)! - fix insert wrong path

*   [`a3582ba4`](https://github.com/worktile/plait/commit/a3582ba4516385c9500110a124064df259cd954c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - should always fire dnd when exist valid targetElement

## 0.15.0

### Minor Changes

-   [`38376389`](https://github.com/worktile/plait/commit/38376389ea98cbcf92dfea227a3295fb7c1addd2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve moving point:
    BOARD_TO_MOVING_POINT_IN_BOARD sa point in board and will clear when mouse leave board
    BOARD_TO_MOVING_POINT as point in document and will clear when mouse leave document

### Patch Changes

-   [`9459fbf7`](https://github.com/worktile/plait/commit/9459fbf7995d7a665ef3834040d7e54acbee028c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modify insertClipboardData to get correctly text size

*   [#461](https://github.com/worktile/plait/pull/461) [`2760bbaa`](https://github.com/worktile/plait/commit/2760bbaaf113a9e72e305887e7e21f6350c39913) Thanks [@WBbug](https://github.com/WBbug)! - add drawBezierPath to fix draw indent-link

## 0.14.0

### Minor Changes

-   [`38f7ebc8`](https://github.com/worktile/plait/commit/38f7ebc8d15fef7a22854a427d029b8461dec529) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename getEditor to getTextEditor and add hasMounted method

*   [`70decd64`](https://github.com/worktile/plait/commit/70decd6490505aa90a4e0d06832a1383e822e726) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getTextFromClipboard and buildText
    support font family and plait text when build node from clipboard

-   [`f6c69574`](https://github.com/worktile/plait/commit/f6c69574caf8cdbbf7850695388757a90ed9cc25) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor get text size

## 0.13.0

### Minor Changes

-   [#454](https://github.com/worktile/plait/pull/454) [`da41655`](https://github.com/worktile/plait/commit/da416559d5f517f43e69a75b7b3db6afdadab437) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor with-mind-hotkey logic
    Add util methods about testing
    Add unit tests about with-mind-hotkey

*   [`ef7cdbe`](https://github.com/worktile/plait/commit/ef7cdbe39cc219493f36d64d5b3eb45d4932834a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move shortcut logic to with mind hotkey plugin from with mind plugin

### Patch Changes

-   [`c4acb4f`](https://github.com/worktile/plait/commit/c4acb4fbaea083bd8bfa9c8041eab6006ca1f0d6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - specify the default font family to avoid unexpected text breaks in different scene
    move buffer width to global

*   [`7002f72`](https://github.com/worktile/plait/commit/7002f7236e4ab432aff344097651ba60d19c9862) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove getMovingPoint condition

## 0.12.2

### Patch Changes

-   [`bfd3317`](https://github.com/worktile/plait/commit/bfd3317cb459cf98e7de2f5533597cb037345c88) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove opacity property to solve text position waring when dragging node in safari
    this commit will drop text opacity feature when mind-nodes are dragging

*   [#452](https://github.com/worktile/plait/pull/452) [`6c6df10`](https://github.com/worktile/plait/commit/6c6df10f0a5f49696bfbb1d0f528405d2058e18d) Thanks [@WBbug](https://github.com/WBbug)! - change timing of set resizeState

-   [`615cd9d`](https://github.com/worktile/plait/commit/615cd9d26beb8ce8b96f1858ad2c0580167c8a2c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct with node dnd condition

*   [#453](https://github.com/worktile/plait/pull/453) [`9204183`](https://github.com/worktile/plait/commit/9204183c2823a3496bb7b892d9a46d489a3735c9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add editing class when text enter edit

-   [`d3c392c`](https://github.com/worktile/plait/commit/d3c392ce9bd48e65d6f0d7f49c2e8a4bb7597e08) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - getHitElements add match options
    add layer concept in with node dnd and filter invalid selected elements

## 0.12.1

### Patch Changes

-   [`c5e183b`](https://github.com/worktile/plait/commit/c5e183be59de6e6f66b640713ab2b6d7975a5c8b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve mind node text style
    add branch class to branch node

## 0.12.0

### Minor Changes

-   [#445](https://github.com/worktile/plait/pull/445) [`c2de796`](https://github.com/worktile/plait/commit/c2de796c03de8c8223ce71f22ee08f7e71103f51) Thanks [@WBbug](https://github.com/WBbug)! - add withText, add textPlugins in mindOptions

### Patch Changes

-   [`9625725`](https://github.com/worktile/plait/commit/962572576e5d86098de0c006997a2460e344f0e3) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct buffer width location

*   [`25ec6f6`](https://github.com/worktile/plait/commit/25ec6f6f1e44cd042bbdf98f36e20b866ac88ba1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move width buffer from text to mind
    solve the problem that the flow text cannot be displayed in the center

## 0.11.0

### Minor Changes

-   [`bab1d19`](https://github.com/worktile/plait/commit/bab1d19de20311ed7eafd7f55088fa288d6d931b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support fit viewport width

### Patch Changes

-   [`fcaf818`](https://github.com/worktile/plait/commit/fcaf818d50e2789c67607214dc10ab27161bc3cc) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle correctly order when hit element

## 0.10.0

### Minor Changes

-   [#430](https://github.com/worktile/plait/pull/430) [`372ecab`](https://github.com/worktile/plait/commit/372ecabf88382c58382d992f3041e45b9aac7584) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - replace richtext component by slate-angular

*   [#430](https://github.com/worktile/plait/pull/430) [`275f9ce`](https://github.com/worktile/plait/commit/275f9ce077b652f7cd01fb6c994034243aea7742) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add format text

-   [#433](https://github.com/worktile/plait/pull/433) [`fc8e7f9`](https://github.com/worktile/plait/commit/fc8e7f96174462f95f4c69138fd14df841e00c91) Thanks [@WBbug](https://github.com/WBbug)! - add CollapseGenerator

*   [#430](https://github.com/worktile/plait/pull/430) [`7adcf10`](https://github.com/worktile/plait/commit/7adcf1003d699d61bab5512f5e72817697270a19) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename richtext to text

-   [#430](https://github.com/worktile/plait/pull/430) [`81d3d9d`](https://github.com/worktile/plait/commit/81d3d9d2e628ad1d41488516b2ffec2aad4dc69c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename richtext to text

*   [#434](https://github.com/worktile/plait/pull/434) [`3d758a8`](https://github.com/worktile/plait/commit/3d758a8caef7e6c6d1fa41a11fe59decf784ae31) Thanks [@WBbug](https://github.com/WBbug)! - support change text mark

### Patch Changes

-   [#437](https://github.com/worktile/plait/pull/437) [`e1fa8d5`](https://github.com/worktile/plait/commit/e1fa8d5670187684af2165d9396daa76691f6dd0) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - improve text size utils method
    fix text paste error

## 0.9.0

### Minor Changes

-   [#427](https://github.com/worktile/plait/pull/427) [`913409e`](https://github.com/worktile/plait/commit/913409eaa64ca86033ed18e15741eb778cc7bf77) Thanks [@WBbug](https://github.com/WBbug)! - change draw quick insert logic

### Patch Changes

-   [`e8c227a`](https://github.com/worktile/plait/commit/e8c227ad255fe30d2e3612e492d4d2a8b5242e32) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - just set board-host-svg style

*   [`e0deea0`](https://github.com/worktile/plait/commit/e0deea0dff37c08cf945260e789c25dff230e571) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - clear selectedElements when create mind

## 0.8.0

### Minor Changes

-   [#419](https://github.com/worktile/plait/pull/419) [`5244a4a`](https://github.com/worktile/plait/commit/5244a4ade82bc8afa80e13cc8a15dce859db6dc8) Thanks [@WBbug](https://github.com/WBbug)! - change getBranchColorByMindElement logic

*   [#421](https://github.com/worktile/plait/pull/421) [`ebab352`](https://github.com/worktile/plait/commit/ebab35228a803ee32576503d1cd5a5832b916f41) Thanks [@WBbug](https://github.com/WBbug)! - let polyline always have straight line

-   [#420](https://github.com/worktile/plait/pull/420) [`715f4ce`](https://github.com/worktile/plait/commit/715f4ceeaf8bee450c252c0c513aa5043ad92bbb) Thanks [@WBbug](https://github.com/WBbug)! - fix getPathByDropTarget logic

### Patch Changes

-   [`bb4cb2c`](https://github.com/worktile/plait/commit/bb4cb2cca4d067f024b44c9db4ee966e00b6032b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct node extend circle stroke width

*   [#425](https://github.com/worktile/plait/pull/425) [`f92759b`](https://github.com/worktile/plait/commit/f92759b63ef9d2b6e7b4579a408467ad72af51de) Thanks [@WBbug](https://github.com/WBbug)! - change abstract link shape logic

-   [`36bf536`](https://github.com/worktile/plait/commit/36bf5369d31dda65a47b857d31e6f3f732147270) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - do not set node when width and height have not changed

*   [`1c0ef14`](https://github.com/worktile/plait/commit/1c0ef14dc313d2bbd9b1b5633cc2470d4ca8d093) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent text from being selected when drag mind node

-   [#424](https://github.com/worktile/plait/pull/424) [`fa15771`](https://github.com/worktile/plait/commit/fa15771e37bea8006c50b32170a9f3e78ec7383c) Thanks [@WBbug](https://github.com/WBbug)! - add underline

## 0.7.0

### Minor Changes

-   [#417](https://github.com/worktile/plait/pull/417) [`4f2d0d7`](https://github.com/worktile/plait/commit/4f2d0d7f1eac88c73a96abe1eb21870bd349c893) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove mind node property inheritance logic and remove default properties

*   [#418](https://github.com/worktile/plait/pull/418) [`2577747`](https://github.com/worktile/plait/commit/2577747bb0a0ba9ba4e569cbba26da4cac8f2886) Thanks [@WBbug](https://github.com/WBbug)! - add INHERIT_ATTRIBUTE_KEYS

## 0.6.0

### Minor Changes

-   [#415](https://github.com/worktile/plait/pull/415) [`3c978fa`](https://github.com/worktile/plait/commit/3c978fa0370d50b459c2cd9d965bd37d6278e97d) Thanks [@WBbug](https://github.com/WBbug)! - get parent branch width when draw link

*   [#408](https://github.com/worktile/plait/pull/408) [`3512152`](https://github.com/worktile/plait/commit/3512152c9ab4db9a904f394539ccd2f073f6c4b7) Thanks [@WBbug](https://github.com/WBbug)! - add ThemeColor and MindThemeColor

-   [`d3d5d40`](https://github.com/worktile/plait/commit/d3d5d4080f91ce1b2cfd0bcee87f53a7dd4978c6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support board hotkey and mind hotkey

*   [#413](https://github.com/worktile/plait/pull/413) [`675a29e`](https://github.com/worktile/plait/commit/675a29ed9a1e267bcc8a9dcec8742b3b14fcd802) Thanks [@WBbug](https://github.com/WBbug)! - let core and mind support change themeColor

-   [#406](https://github.com/worktile/plait/pull/406) [`50bcc1e`](https://github.com/worktile/plait/commit/50bcc1e6c93315965f8c24bc282a9a2f4d78a7dd) Thanks [@WBbug](https://github.com/WBbug)! - adjust insertMindElement logic

### Patch Changes

-   [`f5c8410`](https://github.com/worktile/plait/commit/f5c8410b161110a911ae879da6efc61f396fb515) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - initialize theme color

## 0.5.0

### Minor Changes

-   [#404](https://github.com/worktile/plait/pull/404) [`b465ed2`](https://github.com/worktile/plait/commit/b465ed2e2db585472913c46c878120176fff5bee) Thanks [@WBbug](https://github.com/WBbug)! - fit standard dnd

*   [#399](https://github.com/worktile/plait/pull/399) [`30431d0`](https://github.com/worktile/plait/commit/30431d0a97cf112b6447755a616595fadf4e8567) Thanks [@WBbug](https://github.com/WBbug)! - change get branch color logic when draw link

-   [#405](https://github.com/worktile/plait/pull/405) [`6895755`](https://github.com/worktile/plait/commit/6895755df95aacb46488a7f34124150e5baa67d1) Thanks [@WBbug](https://github.com/WBbug)! - fix emoji doesn't show when drag node

*   [#401](https://github.com/worktile/plait/pull/401) [`fb4a2d3`](https://github.com/worktile/plait/commit/fb4a2d35166b9d21e6d90cfdc519bb804bc262a9) Thanks [@WBbug](https://github.com/WBbug)! - only draw select node when dragging

-   [#400](https://github.com/worktile/plait/pull/400) [`447c97e`](https://github.com/worktile/plait/commit/447c97e61355602dd4cecb39acb8a1e2460adbf7) Thanks [@WBbug](https://github.com/WBbug)! - adjust abstract to node when drop in correspond abstract

### Patch Changes

-   [`5948756`](https://github.com/worktile/plait/commit/59487560f9ca5124078bfda115fca52b517559f2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent mouse down action when pointer is mind

*   [`811e36f`](https://github.com/worktile/plait/commit/811e36f9d46f1e01d972453e0ad17b9da027fa89) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Add the `disabledScrollOnNonFocus` option to control whether scrolling is allowed when the board is not focused.

-   [`fcf3fee`](https://github.com/worktile/plait/commit/fcf3feee6f981c815db6eeca733f45bd5670621d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - solve readonly can not collapse node issue

*   [`d40e5b0`](https://github.com/worktile/plait/commit/d40e5b08624b5d289763eb24bf7bbc4c7fb58058) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support isDisabledSelect option within withSelection
    set isDisabledSelect on mouse down emoji and create mind

## 0.4.0

### Minor Changes

-   [#394](https://github.com/worktile/plait/pull/394) [`fffc901`](https://github.com/worktile/plait/commit/fffc901674f3841461dff8c9e28dd20efe9a5754) Thanks [@WBbug](https://github.com/WBbug)! - support draw polyline

*   [#391](https://github.com/worktile/plait/pull/391) [`3d89e58`](https://github.com/worktile/plait/commit/3d89e58c39ffac99780be6b24dcf1c9b8f60872c) Thanks [@WBbug](https://github.com/WBbug)! - add setRightNodeCountByRefs

-   [#398](https://github.com/worktile/plait/pull/398) [`75e4b7b`](https://github.com/worktile/plait/commit/75e4b7b5de11b3e059d858eaecc226102570e239) Thanks [@WBbug](https://github.com/WBbug)! - change select when dnd over

*   [#397](https://github.com/worktile/plait/pull/397) [`b172f35`](https://github.com/worktile/plait/commit/b172f3530603c8710adfed6a7fa5fc6fe48498e1) Thanks [@WBbug](https://github.com/WBbug)! - support draw abstract and indent polyline

### Patch Changes

-   [`49f50fc`](https://github.com/worktile/plait/commit/49f50fcff2e9695938e4b3d8661b94376d8df47f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add pointer button in constants

*   [`130b015`](https://github.com/worktile/plait/commit/130b015ecff75b9827e2c7ac136d6c9f6dc66c8b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - selected mind when create and insert success

-   [#392](https://github.com/worktile/plait/pull/392) [`e948d94`](https://github.com/worktile/plait/commit/e948d948e1314b34a142713734d9116abc937947) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor draw function directory structure

## 0.3.1

### Patch Changes

-   [`38d7582`](https://github.com/worktile/plait/commit/38d7582c2398f1535aa6e824987bc626fc2d353f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - export utils node

## 0.3.0

### Minor Changes

-   [#387](https://github.com/worktile/plait/pull/387) [`25af7dd`](https://github.com/worktile/plait/commit/25af7dd4769d667244888f5a6b739996ab7c8362) Thanks [@WBbug](https://github.com/WBbug)! - deal select mind when dnd

*   [#385](https://github.com/worktile/plait/pull/385) [`3965b9e`](https://github.com/worktile/plait/commit/3965b9ef54b1fe4c99e0b8de146a55cd873908f2) Thanks [@WBbug](https://github.com/WBbug)! - deal abstract when dnd

-   [#384](https://github.com/worktile/plait/pull/384) [`9a015be`](https://github.com/worktile/plait/commit/9a015beea5f00c20a9653fd3f6472410176d034b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support with mind create plugin

*   [#382](https://github.com/worktile/plait/pull/382) [`70dd054`](https://github.com/worktile/plait/commit/70dd054ec9d8124e94b7d2b47244808700e49bc7) Thanks [@WBbug](https://github.com/WBbug)! - support multiple dnd

### Patch Changes

-   [#380](https://github.com/worktile/plait/pull/380) [`6cd565b`](https://github.com/worktile/plait/commit/6cd565bd8e28f795601505496e980c474750f171) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor plugin folder structure
    add with mind create entry

*   [#374](https://github.com/worktile/plait/pull/374) [`6e557f9`](https://github.com/worktile/plait/commit/6e557f9e3d8a9639e16d3eaea73da2ad9ae7de2d) Thanks [@WBbug](https://github.com/WBbug)! - let getPathByDropTarget use first detect result

-   [`a773e65`](https://github.com/worktile/plait/commit/a773e65096cbe7b4af6eec5bc16d950f92badb2b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - with mind create support hotkey

*   [`0d54f28`](https://github.com/worktile/plait/commit/0d54f28bf0f398081ffa237169231a51dbbdd16b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getValidAbstractRefs function to get valid abstract and its references
    fix test import error

-   [#377](https://github.com/worktile/plait/pull/377) [`266ced0`](https://github.com/worktile/plait/commit/266ced0fd3303e8ac28ba24459e0f36e6b71eb7a) Thanks [@WBbug](https://github.com/WBbug)! - fix dnd bugs

*   [#373](https://github.com/worktile/plait/pull/373) [`796e255`](https://github.com/worktile/plait/commit/796e255008156226f42b509c50ac6b37d4d83e8f) Thanks [@WBbug](https://github.com/WBbug)! - change updatePathByLayoutAndDropTarget function of dnd

-   [#375](https://github.com/worktile/plait/pull/375) [`953ffd8`](https://github.com/worktile/plait/commit/953ffd8402ea5ef073891b0e11614a1983455a6e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - move getXXXRectangle and isHitXXX to folder of position
    move node-space and layout-options to folder of space
    add testing in core
    add testing in mind

*   [`7aedb47`](https://github.com/worktile/plait/commit/7aedb47b8c3afe84ea041ed9a7dc7f3788db7fdb) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - build clip board data by abstract ref

-   [#386](https://github.com/worktile/plait/pull/386) [`a6e9391`](https://github.com/worktile/plait/commit/a6e93914186337778ec954c62512cab263890b3b) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - bump peerDependencies angular version to 15.x

*   [`75ddf4b`](https://github.com/worktile/plait/commit/75ddf4bc7a3d11a9f6d7b15941a6367f788eefd5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add get x distance between point

-   [#378](https://github.com/worktile/plait/pull/378) [`de01d59`](https://github.com/worktile/plait/commit/de01d59955606679d8dc2615acd3122be7036225) Thanks [@WBbug](https://github.com/WBbug)! - refactor dnd

*   [#372](https://github.com/worktile/plait/pull/372) [`0e8a7c0`](https://github.com/worktile/plait/commit/0e8a7c05d3fe754650ac25efe8ec9f61b4329461) Thanks [@WBbug](https://github.com/WBbug)! - change detectDropTarget logic

-   [#370](https://github.com/worktile/plait/pull/370) [`abe0061`](https://github.com/worktile/plait/commit/abe0061f3483fe33f67d6946f87eade93eb597b7) Thanks [@WBbug](https://github.com/WBbug)! - optimize mousedown and utils

## 0.2.2

### Patch Changes

-   [`e7fa326`](https://github.com/worktile/plait/commit/e7fa326c5503785770e6064ba0e8fd77774b4716) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add ngZone run when onChange

*   [`2a627d6`](https://github.com/worktile/plait/commit/2a627d6ebbd5a1546b8850f4bfae006c12da93af) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add parent in plugin element context
    fix re-draw link logic use correct parent

## 0.2.0

### Minor Changes

-   [`fb968a4`](https://github.com/worktile/plait/commit/fb968a49fa95ab8c23c0512ba40aa931c6af0ab1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - mindmap rename to mind

*   [#321](https://github.com/worktile/plait/pull/321) [`fe2bbb6`](https://github.com/worktile/plait/commit/fe2bbb60e0a452f98383a81eff0fb77a32f7ddc7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor plait core plugin element component structure

-   [`304f2b9`](https://github.com/worktile/plait/commit/304f2b9a613266e5f73b4d3b3403f6ad7aa1b9a2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename package name to mind

### Patch Changes

-   [#366](https://github.com/worktile/plait/pull/366) [`30e8a29`](https://github.com/worktile/plait/commit/30e8a295b472499cc2ac3cd1c72c830546cd54e7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - extract abstract node transforms function to transforms/abstract-node

*   [#353](https://github.com/worktile/plait/pull/353) [`4d00bad`](https://github.com/worktile/plait/commit/4d00bad7e88e3187ec8546baf5c8a07fda33fe46) Thanks [@WBbug](https://github.com/WBbug)! - change abstract when abstract include cross left and right

-   [`deb3a01`](https://github.com/worktile/plait/commit/deb3a01864a7135bd268e1879dca802c861cbe56) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct createMindmapData logic and rename to createDefaultMindMapElement

*   [`7de0242`](https://github.com/worktile/plait/commit/7de0242ee4413e06fcdfccf12ad7a5ce9a485284) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix getStrokeByMindElement wrong

-   [#355](https://github.com/worktile/plait/pull/355) [`771b8ba`](https://github.com/worktile/plait/commit/771b8babb7d9170370be6fc0170c59c2b083af84) Thanks [@WBbug](https://github.com/WBbug)! - handle abstract when add and delete node

*   [`a60be13`](https://github.com/worktile/plait/commit/a60be13f6cc5e386b61c136d3f0bbcf4b8026af5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct node extend's style

-   [#341](https://github.com/worktile/plait/pull/341) [`c8a88a7`](https://github.com/worktile/plait/commit/c8a88a74d3c7b430841791c04a89cc70a570ea7a) Thanks [@WBbug](https://github.com/WBbug)! - change layout when node is abstract

*   [#330](https://github.com/worktile/plait/pull/330) [`55a4d32`](https://github.com/worktile/plait/commit/55a4d322455416600da7eb26431052de4f58050f) Thanks [@WBbug](https://github.com/WBbug)! - abstract link adapter to logic layouts

-   [`b30a7a3`](https://github.com/worktile/plait/commit/b30a7a3170e64cca2a597199eee2a3acd354bfc8) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor constants construction

*   [#340](https://github.com/worktile/plait/pull/340) [`9c73bf0`](https://github.com/worktile/plait/commit/9c73bf0fe611c4cab6ee272ffdf6d34b97476612) Thanks [@WBbug](https://github.com/WBbug)! - achieve drag change abstract included node

-   [#337](https://github.com/worktile/plait/pull/337) [`844d3c4`](https://github.com/worktile/plait/commit/844d3c42023ef8b5c37225e57298eb43b062ae6c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support mind node emoji label

*   [#360](https://github.com/worktile/plait/pull/360) [`f074b85`](https://github.com/worktile/plait/commit/f074b85b37ef008f50c09ee09288bbc08f455008) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - get correct layout when node is abstract or child of abstract

-   [#344](https://github.com/worktile/plait/pull/344) [`47ac10f`](https://github.com/worktile/plait/commit/47ac10f3ebe5e142c2b7d250bc639409bff6198f) Thanks [@WBbug](https://github.com/WBbug)! - add abstract util function

*   [`ebcd107`](https://github.com/worktile/plait/commit/ebcd10767790ed471aa9a49760bf2386aa09942b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor node-space
    prevent hit node when click in emoji rectangle

-   [#330](https://github.com/worktile/plait/pull/330) [`55a4d32`](https://github.com/worktile/plait/commit/55a4d322455416600da7eb26431052de4f58050f) Thanks [@WBbug](https://github.com/WBbug)! - add abstract

*   [#365](https://github.com/worktile/plait/pull/365) [`4aa6168`](https://github.com/worktile/plait/commit/4aa61680ba61ba592017a06583060a83f869dd53) Thanks [@WBbug](https://github.com/WBbug)! - add updateAbstractInDnd function

-   [`67d10e1`](https://github.com/worktile/plait/commit/67d10e14c0d187da43c727b4877db1b76a916e4b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add input board on emoji-base component

*   [`e4a8029`](https://github.com/worktile/plait/commit/e4a8029552c64f1d60fa4ae7c8e3f80c9a528eb7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support mind options

-   [`af5e5ba`](https://github.com/worktile/plait/commit/af5e5baade7e06e524b506e39416d38f33823abe) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix shouldChangeRightNodeCount logic error

*   [`da64e36`](https://github.com/worktile/plait/commit/da64e36cda13300ea6c30535dfdb4a6525f70482) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename isIntersect to isHit and fix isHit float calculate error

-   [#346](https://github.com/worktile/plait/pull/346) [`37e66e7`](https://github.com/worktile/plait/commit/37e66e73c110a6059d3265af30b26fc32ad0e37e) Thanks [@WBbug](https://github.com/WBbug)! - forbidden drag when node is abstract

*   [#357](https://github.com/worktile/plait/pull/357) [`ced7468`](https://github.com/worktile/plait/commit/ced7468ad3c8553ce5d3371d9ae9fc4bfb5cb7fa) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor mind node style util method

-   [`ad69dba`](https://github.com/worktile/plait/commit/ad69dba3236fef08d1547b230f2a12b07e9196d5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - compatible processing for last character can not show in safari browser

*   [`ba12a1e`](https://github.com/worktile/plait/commit/ba12a1eaaf8f475a771a893e70bfc422cd02b087) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - can not invoke getNode before auto layout execution

-   [`c4f220d`](https://github.com/worktile/plait/commit/c4f220ddf26364fb87e961f87603fbe68ef77fd3) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add replaceEmoji method and fix addEmoji error
    rename mind map to mind

*   [#342](https://github.com/worktile/plait/pull/342) [`005b600`](https://github.com/worktile/plait/commit/005b600391db12d114d4a9b85cf1538e8f2e0834) Thanks [@WBbug](https://github.com/WBbug)! - fix abstract layout in standard layout

-   [#347](https://github.com/worktile/plait/pull/347) [`4fb5ae9`](https://github.com/worktile/plait/commit/4fb5ae9636ac7a38031e0f5d0cec79ff3ac1500a) Thanks [@WBbug](https://github.com/WBbug)! - select abstract start when delete abstract

*   [`46719b3`](https://github.com/worktile/plait/commit/46719b3f20982a97cbca9b056ffcb8aeb4d95ec7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add base drawer and implement quick insert drawer

-   [#348](https://github.com/worktile/plait/pull/348) [`4d65ce8`](https://github.com/worktile/plait/commit/4d65ce8e7d600b6fe0f9b632c47dbd94c01ae4d8) Thanks [@WBbug](https://github.com/WBbug)! - inherit branchColor when add new element

*   [#367](https://github.com/worktile/plait/pull/367) [`f7ee5af`](https://github.com/worktile/plait/commit/f7ee5af5c4f6b53a17fdedc652ed982dfff23733) Thanks [@WBbug](https://github.com/WBbug)! - skip abstract when get drag direction

-   [#339](https://github.com/worktile/plait/pull/339) [`da6c2d9`](https://github.com/worktile/plait/commit/da6c2d953cd64b5e9fd67bd7615e4524e82658b6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - limit mind node max word count

*   [#334](https://github.com/worktile/plait/pull/334) [`256598c`](https://github.com/worktile/plait/commit/256598cc442a127e3828f2961cdd4a5319043bdc) Thanks [@WBbug](https://github.com/WBbug)! - let extend doesn't show when element is moving

-   [`74fc83d`](https://github.com/worktile/plait/commit/74fc83df096f3e91a6cc6f91351fa0bf1ed6e74d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix fake node text max width

*   [`4e69fd8`](https://github.com/worktile/plait/commit/4e69fd8a1a79c1ec9c812d24337d6aa23458bbf8) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct mind node stroke extend logic

-   [`6580ea0`](https://github.com/worktile/plait/commit/6580ea08c93f67ecca69594964abf6dd632da0ce) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename mindmap to mind

*   [#356](https://github.com/worktile/plait/pull/356) [`ea52a05`](https://github.com/worktile/plait/commit/ea52a0545bab90e25e76f061ec6811793e4f9b32) Thanks [@WBbug](https://github.com/WBbug)! - fix copy abstract wrong

-   [#335](https://github.com/worktile/plait/pull/335) [`3c02181`](https://github.com/worktile/plait/commit/3c021816eefeb53fb003d6f87b7effd515d994c3) Thanks [@WBbug](https://github.com/WBbug)! - add drawAbstractIncludedOutline

*   [`0149e57`](https://github.com/worktile/plait/commit/0149e57c9055c09cb64b2974f802a4e996b92f26) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - apply correctly abstract link and child link style

-   [`ba40d29`](https://github.com/worktile/plait/commit/ba40d298c0abe636024795cf510ee92ca1c35d68) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - mind node dnd support draw emojis

*   [`076e435`](https://github.com/worktile/plait/commit/076e4356bcef2f5d142d6fcc4d1cf0a9903ae681) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - createMindElement support more options

-   [#338](https://github.com/worktile/plait/pull/338) [`e7a157b`](https://github.com/worktile/plait/commit/e7a157bf19fb2c0cb3865912f78f21c557121532) Thanks [@WBbug](https://github.com/WBbug)! - update AbstractIncludedOutline when mouse move

*   [`000f5c4`](https://github.com/worktile/plait/commit/000f5c476d87160cf647335e0af868795942c20c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor getShapeByElement function

-   [`65b5944`](https://github.com/worktile/plait/commit/65b5944adf913290215e15fabc16afa5697e4358) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add element input on emoji base component

*   [`881d901`](https://github.com/worktile/plait/commit/881d901d6e40533d8f44c0d275f7609489ed49ba) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - emoji size and position improve

-   [#352](https://github.com/worktile/plait/pull/352) [`b59ad23`](https://github.com/worktile/plait/commit/b59ad23076254137eeb5fccb99587a385a5d6bcb) Thanks [@WBbug](https://github.com/WBbug)! - update abstract outline when mouseMove

*   [#358](https://github.com/worktile/plait/pull/358) [`76a9410`](https://github.com/worktile/plait/commit/76a9410a2f489e2d8c7efab8b762aefbbe1949c7) Thanks [@WBbug](https://github.com/WBbug)! - fix move can select words, fix cant remove all node, fix drag draw wrong fakeNode

-   [#350](https://github.com/worktile/plait/pull/350) [`c7dcac7`](https://github.com/worktile/plait/commit/c7dcac781dc0caa8420f95b3089da4baf4b45d7f) Thanks [@WBbug](https://github.com/WBbug)! - add newBoard and execute abstractResize in with-abstract

*   [`ff1b1f0`](https://github.com/worktile/plait/commit/ff1b1f0d7d59fc4bc62df0e853eaa61a7aca6f8f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor node equality judge logic
    remove findParentElement function (replace by MindElement.findParent)
    rename filterChildElement to getFirstLevelElement

-   [#368](https://github.com/worktile/plait/pull/368) [`196c4bc`](https://github.com/worktile/plait/commit/196c4bc30a22308b0fb04b8f183e06762a3c5ae1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modify getCorrectLayoutByElement logic to fit abstract layout

*   [`2ae1307`](https://github.com/worktile/plait/commit/2ae1307d4cfd19659fa657fc42e9c483aee44956) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove use MIND_ELEMENT_TO_COMPONENT case

-   [#349](https://github.com/worktile/plait/pull/349) [`874a97a`](https://github.com/worktile/plait/commit/874a97a79d172cd7a25c75320547caa253ead35e) Thanks [@WBbug](https://github.com/WBbug)! - fix delete error

*   [#351](https://github.com/worktile/plait/pull/351) [`8cb2b47`](https://github.com/worktile/plait/commit/8cb2b47773a4f673013b34d4b8ddb56ec4e06855) Thanks [@WBbug](https://github.com/WBbug)! - fix canDraw logic

-   [`dddac29`](https://github.com/worktile/plait/commit/dddac293890e2904a550ae9e5fc6de54f757138f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix mind node topic data structure error when node is copied and pasted

*   [#362](https://github.com/worktile/plait/pull/362) [`a8623c8`](https://github.com/worktile/plait/commit/a8623c87e930b69b180d67b509eb643f2184f76d) Thanks [@WBbug](https://github.com/WBbug)! - fix get wrong layout

-   [#364](https://github.com/worktile/plait/pull/364) [`64ab8fd`](https://github.com/worktile/plait/commit/64ab8fd5ae6b523f7b7a1358afb72fe113f48660) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle overall abstract when copy node and paste

## 0.2.0-next.11

### Patch Changes

-   [`74fc83d`](https://github.com/worktile/plait/commit/74fc83df096f3e91a6cc6f91351fa0bf1ed6e74d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix fake node text max width

*   [`ba40d29`](https://github.com/worktile/plait/commit/ba40d298c0abe636024795cf510ee92ca1c35d68) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - mind node dnd support draw emojis

-   [`ff1b1f0`](https://github.com/worktile/plait/commit/ff1b1f0d7d59fc4bc62df0e853eaa61a7aca6f8f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor node equality judge logic
    remove findParentElement function (replace by MindElement.findParent)
    rename filterChildElement to getFirstLevelElement

## 0.2.0-next.10

### Patch Changes

-   [`ebcd107`](https://github.com/worktile/plait/commit/ebcd10767790ed471aa9a49760bf2386aa09942b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor node-space
    prevent hit node when click in emoji rectangle

*   [`4e69fd8`](https://github.com/worktile/plait/commit/4e69fd8a1a79c1ec9c812d24337d6aa23458bbf8) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct mind node stroke extend logic

-   [`000f5c4`](https://github.com/worktile/plait/commit/000f5c476d87160cf647335e0af868795942c20c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor getShapeByElement function

## 0.2.0-next.9

### Patch Changes

-   [#366](https://github.com/worktile/plait/pull/366) [`30e8a29`](https://github.com/worktile/plait/commit/30e8a295b472499cc2ac3cd1c72c830546cd54e7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - extract abstract node transforms function to transforms/abstract-node

*   [`a60be13`](https://github.com/worktile/plait/commit/a60be13f6cc5e386b61c136d3f0bbcf4b8026af5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct node extend's style

-   [`b30a7a3`](https://github.com/worktile/plait/commit/b30a7a3170e64cca2a597199eee2a3acd354bfc8) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor constants construction

*   [#360](https://github.com/worktile/plait/pull/360) [`f074b85`](https://github.com/worktile/plait/commit/f074b85b37ef008f50c09ee09288bbc08f455008) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - get correct layout when node is abstract or child of abstract

-   [#365](https://github.com/worktile/plait/pull/365) [`4aa6168`](https://github.com/worktile/plait/commit/4aa61680ba61ba592017a06583060a83f869dd53) Thanks [@WBbug](https://github.com/WBbug)! - add updateAbstractInDnd function

*   [#367](https://github.com/worktile/plait/pull/367) [`f7ee5af`](https://github.com/worktile/plait/commit/f7ee5af5c4f6b53a17fdedc652ed982dfff23733) Thanks [@WBbug](https://github.com/WBbug)! - skip abstract when get drag direction

-   [`0149e57`](https://github.com/worktile/plait/commit/0149e57c9055c09cb64b2974f802a4e996b92f26) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - apply correctly abstract link and child link style

*   [#368](https://github.com/worktile/plait/pull/368) [`196c4bc`](https://github.com/worktile/plait/commit/196c4bc30a22308b0fb04b8f183e06762a3c5ae1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modify getCorrectLayoutByElement logic to fit abstract layout

-   [#362](https://github.com/worktile/plait/pull/362) [`a8623c8`](https://github.com/worktile/plait/commit/a8623c87e930b69b180d67b509eb643f2184f76d) Thanks [@WBbug](https://github.com/WBbug)! - fix get wrong layout

*   [#364](https://github.com/worktile/plait/pull/364) [`64ab8fd`](https://github.com/worktile/plait/commit/64ab8fd5ae6b523f7b7a1358afb72fe113f48660) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - handle overall abstract when copy node and paste

## 0.2.0-next.8

### Patch Changes

-   [`e4a8029`](https://github.com/worktile/plait/commit/e4a8029552c64f1d60fa4ae7c8e3f80c9a528eb7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support mind options

## 0.2.0-next.7

### Patch Changes

-   [`65b5944`](https://github.com/worktile/plait/commit/65b5944adf913290215e15fabc16afa5697e4358) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add element input on emoji base component

## 0.2.0-next.6

### Patch Changes

-   [`881d901`](https://github.com/worktile/plait/commit/881d901d6e40533d8f44c0d275f7609489ed49ba) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - emoji size and position improve

*   [#358](https://github.com/worktile/plait/pull/358) [`76a9410`](https://github.com/worktile/plait/commit/76a9410a2f489e2d8c7efab8b762aefbbe1949c7) Thanks [@WBbug](https://github.com/WBbug)! - fix move can select words, fix cant remove all node, fix drag draw wrong fakeNode

## 0.2.0-next.5

### Patch Changes

-   [`7de0242`](https://github.com/worktile/plait/commit/7de0242ee4413e06fcdfccf12ad7a5ce9a485284) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix getStrokeByMindElement wrong

## 0.2.0-next.4

### Patch Changes

-   [#353](https://github.com/worktile/plait/pull/353) [`4d00bad`](https://github.com/worktile/plait/commit/4d00bad7e88e3187ec8546baf5c8a07fda33fe46) Thanks [@WBbug](https://github.com/WBbug)! - change abstract when abstract include cross left and right

*   [#355](https://github.com/worktile/plait/pull/355) [`771b8ba`](https://github.com/worktile/plait/commit/771b8babb7d9170370be6fc0170c59c2b083af84) Thanks [@WBbug](https://github.com/WBbug)! - handle abstract when add and delete node

-   [`67d10e1`](https://github.com/worktile/plait/commit/67d10e14c0d187da43c727b4877db1b76a916e4b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add input board on emoji-base component

*   [#357](https://github.com/worktile/plait/pull/357) [`ced7468`](https://github.com/worktile/plait/commit/ced7468ad3c8553ce5d3371d9ae9fc4bfb5cb7fa) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor mind node style util method

-   [#348](https://github.com/worktile/plait/pull/348) [`4d65ce8`](https://github.com/worktile/plait/commit/4d65ce8e7d600b6fe0f9b632c47dbd94c01ae4d8) Thanks [@WBbug](https://github.com/WBbug)! - inherit branchColor when add new element

*   [#356](https://github.com/worktile/plait/pull/356) [`ea52a05`](https://github.com/worktile/plait/commit/ea52a0545bab90e25e76f061ec6811793e4f9b32) Thanks [@WBbug](https://github.com/WBbug)! - fix copy abstract wrong

## 0.2.0-next.3

### Patch Changes

-   [`af5e5ba`](https://github.com/worktile/plait/commit/af5e5baade7e06e524b506e39416d38f33823abe) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix shouldChangeRightNodeCount logic error

*   [`ad69dba`](https://github.com/worktile/plait/commit/ad69dba3236fef08d1547b230f2a12b07e9196d5) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - compatible processing for last character can not show in safari browser

-   [`c4f220d`](https://github.com/worktile/plait/commit/c4f220ddf26364fb87e961f87603fbe68ef77fd3) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add replaceEmoji method and fix addEmoji error
    rename mind map to mind

*   [#347](https://github.com/worktile/plait/pull/347) [`4fb5ae9`](https://github.com/worktile/plait/commit/4fb5ae9636ac7a38031e0f5d0cec79ff3ac1500a) Thanks [@WBbug](https://github.com/WBbug)! - select abstract start when delete abstract

-   [`6580ea0`](https://github.com/worktile/plait/commit/6580ea08c93f67ecca69594964abf6dd632da0ce) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename mindmap to mind

*   [#352](https://github.com/worktile/plait/pull/352) [`b59ad23`](https://github.com/worktile/plait/commit/b59ad23076254137eeb5fccb99587a385a5d6bcb) Thanks [@WBbug](https://github.com/WBbug)! - update abstract outline when mouseMove

-   [#350](https://github.com/worktile/plait/pull/350) [`c7dcac7`](https://github.com/worktile/plait/commit/c7dcac781dc0caa8420f95b3089da4baf4b45d7f) Thanks [@WBbug](https://github.com/WBbug)! - add newBoard and execute abstractResize in with-abstract

*   [`2ae1307`](https://github.com/worktile/plait/commit/2ae1307d4cfd19659fa657fc42e9c483aee44956) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove use MIND_ELEMENT_TO_COMPONENT case

-   [#349](https://github.com/worktile/plait/pull/349) [`874a97a`](https://github.com/worktile/plait/commit/874a97a79d172cd7a25c75320547caa253ead35e) Thanks [@WBbug](https://github.com/WBbug)! - fix delete error

*   [#351](https://github.com/worktile/plait/pull/351) [`8cb2b47`](https://github.com/worktile/plait/commit/8cb2b47773a4f673013b34d4b8ddb56ec4e06855) Thanks [@WBbug](https://github.com/WBbug)! - fix canDraw logic

## 0.2.0-next.2

### Patch Changes

-   [#344](https://github.com/worktile/plait/pull/344) [`47ac10f`](https://github.com/worktile/plait/commit/47ac10f3ebe5e142c2b7d250bc639409bff6198f) Thanks [@WBbug](https://github.com/WBbug)! - add abstract util function

*   [`da64e36`](https://github.com/worktile/plait/commit/da64e36cda13300ea6c30535dfdb4a6525f70482) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename isIntersect to isHit and fix isHit float calculate error

-   [#346](https://github.com/worktile/plait/pull/346) [`37e66e7`](https://github.com/worktile/plait/commit/37e66e73c110a6059d3265af30b26fc32ad0e37e) Thanks [@WBbug](https://github.com/WBbug)! - forbidden drag when node is abstract

*   [`46719b3`](https://github.com/worktile/plait/commit/46719b3f20982a97cbca9b056ffcb8aeb4d95ec7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add base drawer and implement quick insert drawer

## 0.2.0-next.1

### Patch Changes

-   [`deb3a01`](https://github.com/worktile/plait/commit/deb3a01864a7135bd268e1879dca802c861cbe56) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct createMindmapData logic and rename to createDefaultMindMapElement

## 0.2.0-next.0

### Minor Changes

-   [`fb968a4`](https://github.com/worktile/plait/commit/fb968a49fa95ab8c23c0512ba40aa931c6af0ab1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - mindmap rename to mind

*   [#321](https://github.com/worktile/plait/pull/321) [`fe2bbb6`](https://github.com/worktile/plait/commit/fe2bbb60e0a452f98383a81eff0fb77a32f7ddc7) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor plait core plugin element component structure

-   [`304f2b9`](https://github.com/worktile/plait/commit/304f2b9a613266e5f73b4d3b3403f6ad7aa1b9a2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename package name to mind

### Patch Changes

-   [#341](https://github.com/worktile/plait/pull/341) [`c8a88a7`](https://github.com/worktile/plait/commit/c8a88a74d3c7b430841791c04a89cc70a570ea7a) Thanks [@WBbug](https://github.com/WBbug)! - change layout when node is abstract

*   [#330](https://github.com/worktile/plait/pull/330) [`55a4d32`](https://github.com/worktile/plait/commit/55a4d322455416600da7eb26431052de4f58050f) Thanks [@WBbug](https://github.com/WBbug)! - abstract link adapter to logic layouts

-   [#340](https://github.com/worktile/plait/pull/340) [`9c73bf0`](https://github.com/worktile/plait/commit/9c73bf0fe611c4cab6ee272ffdf6d34b97476612) Thanks [@WBbug](https://github.com/WBbug)! - achieve drag change abstract included node

*   [#337](https://github.com/worktile/plait/pull/337) [`844d3c4`](https://github.com/worktile/plait/commit/844d3c42023ef8b5c37225e57298eb43b062ae6c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support mind node emoji label

-   [#330](https://github.com/worktile/plait/pull/330) [`55a4d32`](https://github.com/worktile/plait/commit/55a4d322455416600da7eb26431052de4f58050f) Thanks [@WBbug](https://github.com/WBbug)! - add abstract

*   [`ba12a1e`](https://github.com/worktile/plait/commit/ba12a1eaaf8f475a771a893e70bfc422cd02b087) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - can not invoke getNode before auto layout execution

-   [#342](https://github.com/worktile/plait/pull/342) [`005b600`](https://github.com/worktile/plait/commit/005b600391db12d114d4a9b85cf1538e8f2e0834) Thanks [@WBbug](https://github.com/WBbug)! - fix abstract layout in standard layout

*   [#339](https://github.com/worktile/plait/pull/339) [`da6c2d9`](https://github.com/worktile/plait/commit/da6c2d953cd64b5e9fd67bd7615e4524e82658b6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - limit mind node max word count

-   [#334](https://github.com/worktile/plait/pull/334) [`256598c`](https://github.com/worktile/plait/commit/256598cc442a127e3828f2961cdd4a5319043bdc) Thanks [@WBbug](https://github.com/WBbug)! - let extend doesn't show when element is moving

*   [#335](https://github.com/worktile/plait/pull/335) [`3c02181`](https://github.com/worktile/plait/commit/3c021816eefeb53fb003d6f87b7effd515d994c3) Thanks [@WBbug](https://github.com/WBbug)! - add drawAbstractIncludedOutline

-   [`076e435`](https://github.com/worktile/plait/commit/076e4356bcef2f5d142d6fcc4d1cf0a9903ae681) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - createMindElement support more options

*   [#338](https://github.com/worktile/plait/pull/338) [`e7a157b`](https://github.com/worktile/plait/commit/e7a157bf19fb2c0cb3865912f78f21c557121532) Thanks [@WBbug](https://github.com/WBbug)! - update AbstractIncludedOutline when mouse move

-   [`dddac29`](https://github.com/worktile/plait/commit/dddac293890e2904a550ae9e5fc6de54f757138f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix mind node topic data structure error when node is copied and pasted

## 0.1.11

### Patch Changes

-   [`d289c23`](https://github.com/worktile/plait/commit/d289c2358c4cd0bb093790d9f663e8043fce759b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct line-height when font size assign 18

## 0.1.10

### Patch Changes

-   [#308](https://github.com/worktile/plait/pull/308) [`638e711`](https://github.com/worktile/plait/commit/638e7110c77e77f4fc702423513e51097e1cc699) Thanks [@WBbug](https://github.com/WBbug)! - forbidden drag when multiple select

## 0.1.9

### Patch Changes

-   [#302](https://github.com/worktile/plait/pull/302) [`735c007`](https://github.com/worktile/plait/commit/735c007b8f0935ccd895d0360edb290339d30841) Thanks [@WBbug](https://github.com/WBbug)! - change logic of after delete selected elements, fix trackBy

*   [#305](https://github.com/worktile/plait/pull/305) [`b52171b`](https://github.com/worktile/plait/commit/b52171b0f9565f5f2c54680f65394b007f6fc70f) Thanks [@WBbug](https://github.com/WBbug)! - add judge when delete node in destroy

-   [`da1f3e2`](https://github.com/worktile/plait/commit/da1f3e2c2a28050f79f464fc62cd8b7ede9cca0a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct richtext style and add get richtext content size func

*   [`81dcd07`](https://github.com/worktile/plait/commit/81dcd0717147203bae51c563b84544f1ece5d863) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add is-dragging state in with-dnd

## 0.1.8

### Patch Changes

-   [#301](https://github.com/worktile/plait/pull/301) [`9ca65d9`](https://github.com/worktile/plait/commit/9ca65d9384f21fda200980d60b2dde770d2ee7b8) Thanks [@WBbug](https://github.com/WBbug)! - change judge condition

*   [#299](https://github.com/worktile/plait/pull/299) [`52ecb12`](https://github.com/worktile/plait/commit/52ecb12296a6323710939ba3ecdf392e822927ff) Thanks [@WBbug](https://github.com/WBbug)! - change root default height

-   [`f897b3d`](https://github.com/worktile/plait/commit/f897b3de35c371d2166e99d7785abdbbd1191721) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - wait node destroy and remove selected element state

## 0.1.6

### Patch Changes

-   [#297](https://github.com/worktile/plait/pull/297) [`92fc60f`](https://github.com/worktile/plait/commit/92fc60fa60bfe763ac86c6164b1adb60c761da46) Thanks [@WBbug](https://github.com/WBbug)! - change inherit attribute

## 0.1.5

### Patch Changes

-   [#291](https://github.com/worktile/plait/pull/291) [`5206cb5`](https://github.com/worktile/plait/commit/5206cb5ae8dac1f3b36989dfb716860e0e185384) Thanks [@WBbug](https://github.com/WBbug)! - change text gap

*   [#290](https://github.com/worktile/plait/pull/290) [`699f9fd`](https://github.com/worktile/plait/commit/699f9fdfe843f9a7fe80bc2ba6708dd00de452ca) Thanks [@WBbug](https://github.com/WBbug)! - fix min width wrong when zoom

-   [#286](https://github.com/worktile/plait/pull/286) [`d526031`](https://github.com/worktile/plait/commit/d5260317eb11ed0f9fb9101cd11eb2060883a4b3) Thanks [@WBbug](https://github.com/WBbug)! - change isIntersectionSelection to isHitSelection

*   [#288](https://github.com/worktile/plait/pull/288) [`02adb8e`](https://github.com/worktile/plait/commit/02adb8eb2af064e89c2755836174c17c2af9d59e) Thanks [@WBbug](https://github.com/WBbug)! - add line-height style

## 0.1.3

### Patch Changes

-   [`4401da6`](https://github.com/worktile/plait/commit/4401da6a2a019d8c7078387eee6529a240b2e887) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct richtext position and size style

*   [#281](https://github.com/worktile/plait/pull/281) [`48e2989`](https://github.com/worktile/plait/commit/48e29896073761bc7c5142c880e1fd2dbc886896) Thanks [@WBbug](https://github.com/WBbug)! - add collapseG, listen collapseG mouseUp event

## 0.1.2

### Patch Changes

-   [#277](https://github.com/worktile/plait/pull/277) [`d69933a`](https://github.com/worktile/plait/commit/d69933aa50e97bd63d6fefc356a10023f5d67f5e) Thanks [@WBbug](https://github.com/WBbug)! - fix extend style

*   [#273](https://github.com/worktile/plait/pull/273) [`2e894d5`](https://github.com/worktile/plait/commit/2e894d5ee5ada069ca5c6ccfd968a0665a0e1422) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add withMove plugin

-   [#280](https://github.com/worktile/plait/pull/280) [`7d301b1`](https://github.com/worktile/plait/commit/7d301b141ade646586723ef27b72ee21172251c7) Thanks [@WBbug](https://github.com/WBbug)! - delete element when destroy

## 0.1.1

### Patch Changes

-   [#272](https://github.com/worktile/plait/pull/272) [`3364882`](https://github.com/worktile/plait/commit/336488248c70839177ac3a93a54369969024667e) Thanks [@WBbug](https://github.com/WBbug)! - set selection when copy

*   [#272](https://github.com/worktile/plait/pull/272) [`19c2e15`](https://github.com/worktile/plait/commit/19c2e154b4a85ded3289dadd40a5d5698c83e394) Thanks [@WBbug](https://github.com/WBbug)! - add set selection with temporary elements

## 0.1.0

### Minor Changes

-   [`42708c2`](https://github.com/worktile/plait/commit/42708c2880be02ed30280d75fc21bb3f143c7537) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Release v0.1.0 to welcome new members @plait/flow 🎉 🎉 🎉 !

### Patch Changes

-   [#235](https://github.com/worktile/plait/pull/235) [`e0be632`](https://github.com/worktile/plait/commit/e0be632e0fd4f4bb47d2a2f75ca2fe2c69653ec2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add element host

*   [#244](https://github.com/worktile/plait/pull/244) [`784150a`](https://github.com/worktile/plait/commit/784150ae8279dd159e7844e68ac01b867058ecda) Thanks [@WBbug](https://github.com/WBbug)! - handle multiple copy and paste

-   [#241](https://github.com/worktile/plait/pull/241) [`8719a47`](https://github.com/worktile/plait/commit/8719a473310f9201e89c6ba131d6458e41884f74) Thanks [@WBbug](https://github.com/WBbug)! - add copy create mindmap, add getRectangleByNodes

*   [#250](https://github.com/worktile/plait/pull/250) [`03132ca`](https://github.com/worktile/plait/commit/03132ca42f28fcadbfb456843047c166261370b9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add text gap constant and apply to text render

-   [#268](https://github.com/worktile/plait/pull/268) [`0336a2a`](https://github.com/worktile/plait/commit/0336a2a3f0e614cddd412b7a8a49792a727400ea) Thanks [@WBbug](https://github.com/WBbug)! - change selection type, add range type

*   [#245](https://github.com/worktile/plait/pull/245) [`8987ff6`](https://github.com/worktile/plait/commit/8987ff6b1a59b966377bf5b2fb53c96af62aa78a) Thanks [@WBbug](https://github.com/WBbug)! - fix delete error, add parentElement judge

-   [#237](https://github.com/worktile/plait/pull/237) [`24899d5`](https://github.com/worktile/plait/commit/24899d56f6cd5fd15ba56762fed741ed847d9c2f) Thanks [@WBbug](https://github.com/WBbug)! - change mindmapComponent select in updateRightNodeCount function

*   [`e6db0bb`](https://github.com/worktile/plait/commit/e6db0bbde464f0f9415f885287e80c99bd11a643) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix save host error in BOARD_TO_HOST

-   [#255](https://github.com/worktile/plait/pull/255) [`4bd2bb9`](https://github.com/worktile/plait/commit/4bd2bb95e2c860e499bd3c583a58fc4c83954c1c) Thanks [@WBbug](https://github.com/WBbug)! - fix multipule delete, change changeRightNodeCount function, delete allowClearBoard option in core

*   [#265](https://github.com/worktile/plait/pull/265) [`0fa71d4`](https://github.com/worktile/plait/commit/0fa71d4d8901deb8129fc73bd922f43aaa56084c) Thanks [@WBbug](https://github.com/WBbug)! - add deleteSelectedElements function , use when cut and delete

-   [#247](https://github.com/worktile/plait/pull/247) [`51bc0c8`](https://github.com/worktile/plait/commit/51bc0c81067a0ea92d02063fef8ca170d4706273) Thanks [@WBbug](https://github.com/WBbug)! - change getWidthByText to getSizeByText, separate buildNodes and buildMindmap function

*   [#259](https://github.com/worktile/plait/pull/259) [`9d217b1`](https://github.com/worktile/plait/commit/9d217b1cdf2afb5f2a34d217ef26cc4892154d60) Thanks [@Ashy6](https://github.com/Ashy6)! - extend style processing when the box is selected

-   [#262](https://github.com/worktile/plait/pull/262) [`8b65ff5`](https://github.com/worktile/plait/commit/8b65ff5b9804e089381f3932420f56e41dab743a) Thanks [@Ashy6](https://github.com/Ashy6)! - refactor with-hand to viewport-moving state

*   [#246](https://github.com/worktile/plait/pull/246) [`1fd3e1f`](https://github.com/worktile/plait/commit/1fd3e1f61711a21247fcd25aea89bd4b1ace20f9) Thanks [@WBbug](https://github.com/WBbug)! - add judge, only select one node can paste text as node

## 0.0.57

### Patch Changes

-   [`2af223f`](https://github.com/worktile/plait/commit/2af223fa6f55b0062da255dd752ae1de236d43a8) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - extract plugin-element-component as base classs, add global ELEMENT_TO_COMPONENT

*   [`4e62c1d`](https://github.com/worktile/plait/commit/4e62c1db0e67e22f4205a1cdabc53b0bad3fb624) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent node editing blur when click the area between richtext and node

-   [`5a3e6f6`](https://github.com/worktile/plait/commit/5a3e6f6fc1f298875d50c369d1135e645934a791) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct right/left/standard layout, reference connecting position in layout

## 0.0.56

### Patch Changes

-   [#220](https://github.com/worktile/plait/pull/220) [`03ba0c2`](https://github.com/worktile/plait/commit/03ba0c293f49f18c6c9f3695ffde2f3fbfffc28a) Thanks [@Maple13](https://github.com/Maple13)! - fix mask display and rendering exception

## 0.0.55

### Patch Changes

-   [#212](https://github.com/worktile/plait/pull/212) [`e587b9c`](https://github.com/worktile/plait/commit/e587b9cd87ef701adb3350155dbcceb70100854c) Thanks [@Maple13](https://github.com/Maple13)! - calculate slip based on matrix

## 0.0.54

### Patch Changes

-   [#216](https://github.com/worktile/plait/pull/216) [`6c5b1a4`](https://github.com/worktile/plait/commit/6c5b1a45c0681773b57760e71b854bc5b017c440) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - the target element does not exist when repairing the new node

## 0.0.53

### Patch Changes

-   [#209](https://github.com/worktile/plait/pull/209) [`6a23d47`](https://github.com/worktile/plait/commit/6a23d473310849ebcef76e7de922ccdac3adf6e2) Thanks [@WBbug](https://github.com/WBbug)! - use correctLayout

*   [#208](https://github.com/worktile/plait/pull/208) [`4e4f2bd`](https://github.com/worktile/plait/commit/4e4f2bdaa1c0c8435fdb9575e78752a5a8941f1c) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - adjust dropTarget and detectResult with parent layout of mindmap dnd

-   [#210](https://github.com/worktile/plait/pull/210) [`5b6fd55`](https://github.com/worktile/plait/commit/5b6fd55d79b7fd3f9af8488b836249bfedc13c4e) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - Mixed layouts in left and right layouts are supported of mindmap dnd

*   [#206](https://github.com/worktile/plait/pull/206) [`3ec162c`](https://github.com/worktile/plait/commit/3ec162c6a920940d9edc6e1d7435a87e9d9f3a9a) Thanks [@WBbug](https://github.com/WBbug)! - fix gGroup insert logic

-   [`8fc1859`](https://github.com/worktile/plait/commit/8fc1859174ee79f69c56b3f405c20fb9c59d227a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update logic link curve

*   [#205](https://github.com/worktile/plait/pull/205) [`4516bdf`](https://github.com/worktile/plait/commit/4516bdf64c715fefb3dcbb28638d802033a5103c) Thanks [@WBbug](https://github.com/WBbug)! - fix correctLayoutByDirection function

-   [#211](https://github.com/worktile/plait/pull/211) [`88761c6`](https://github.com/worktile/plait/commit/88761c6c1ddfe898b2e753089e50fe47b065f167) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor logic link draw method

*   [#213](https://github.com/worktile/plait/pull/213) [`bf23412`](https://github.com/worktile/plait/commit/bf23412060592592cb0b6d1e99ac85d83f0fe762) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - mixed layouts in standared layouts are supported of mindmap dnd

## 0.0.52

### Patch Changes

-   [#202](https://github.com/worktile/plait/pull/202) [`7fb3f90`](https://github.com/worktile/plait/commit/7fb3f904a2a453b92ce69fcf177a5dc61aafd2d4) Thanks [@Maple13](https://github.com/Maple13)! - fixed the problem of node occlusion and jumping when adding new nodes

## 0.0.51

### Patch Changes

-   [#193](https://github.com/worktile/plait/pull/193) [`0289747`](https://github.com/worktile/plait/commit/02897476178fa06f66cd5eaf0847a8e7c610cb42) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix dnd data error of mindmap upward and downward style

## 0.0.50

### Patch Changes

-   [#194](https://github.com/worktile/plait/pull/194) [`a27baa7`](https://github.com/worktile/plait/commit/a27baa7bfe37279f988a1071bc0fe0e7ecb3c397) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix dnd style of mindmap indent layout

*   [#195](https://github.com/worktile/plait/pull/195) [`0ae6eaa`](https://github.com/worktile/plait/commit/0ae6eaa7c48e6e8f1f2e9a86e3ad583d95654b0b) Thanks [@Ashy6](https://github.com/Ashy6)! - course add drag status

-   [#196](https://github.com/worktile/plait/pull/196) [`e62a8e9`](https://github.com/worktile/plait/commit/e62a8e9ebb3bdf3486f5c0b8352dfbb9f0f4bb71) Thanks [@Maple13](https://github.com/Maple13)! - calculate position using matrix, fix node edit state error

## 0.0.49

### Patch Changes

-   [#188](https://github.com/worktile/plait/pull/188) [`1b500f7`](https://github.com/worktile/plait/commit/1b500f72121f76e1e27594200a708a65f3188cc7) Thanks [@Maple13](https://github.com/Maple13)! - modify transforms naming error, remove useless zoom calculation

*   [#187](https://github.com/worktile/plait/pull/187) [`ae90e72`](https://github.com/worktile/plait/commit/ae90e72bb661cf609807ae52db1311efdd999239) Thanks [@Ashy6](https://github.com/Ashy6)! - new node element always in canvas

-   [#190](https://github.com/worktile/plait/pull/190) [`ef4cd22`](https://github.com/worktile/plait/commit/ef4cd22672f72d916f23717672427d349369d18f) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix mindmap dnd style and data

## 0.0.47

### Patch Changes

-   [#160](https://github.com/worktile/plait/pull/160) [`a4413c9`](https://github.com/worktile/plait/commit/a4413c9c52ad31d52e9c9248bfd2ae4c9c6afbed) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix style issues with moving one side of a standard layout to the other of mindmap dnd

*   [#154](https://github.com/worktile/plait/pull/154) [`e128dd7`](https://github.com/worktile/plait/commit/e128dd75d4aea49614545e9229bc9aa187c3d681) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - feat: add direction-correction function

-   [#165](https://github.com/worktile/plait/pull/165) [`a4a54ce`](https://github.com/worktile/plait/commit/a4a54ce81bd8792ccb093a0cd4255c9c331ba531) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - change verticalGap and horizontalGap

*   [#168](https://github.com/worktile/plait/pull/168) [`91ed054`](https://github.com/worktile/plait/commit/91ed0546bac66eb82801f178b214e964b1980022) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - adjust upward and downward layout dnd style

-   [#165](https://github.com/worktile/plait/pull/165) [`a4a54ce`](https://github.com/worktile/plait/commit/a4a54ce81bd8792ccb093a0cd4255c9c331ba531) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - limit the scroll area

*   [#165](https://github.com/worktile/plait/pull/165) [`a4a54ce`](https://github.com/worktile/plait/commit/a4a54ce81bd8792ccb093a0cd4255c9c331ba531) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - stopPropagation when click quickInsert

-   [#153](https://github.com/worktile/plait/pull/153) [`cd185d2`](https://github.com/worktile/plait/commit/cd185d229065bd051b2f1ee8732f5a3f1a2e8418) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - refactor(mindmap): refactor directionDetector function

*   [#157](https://github.com/worktile/plait/pull/157) [`1b167ba`](https://github.com/worktile/plait/commit/1b167ba0c54e2dcf723b93ffe0894676b76ea0ad) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - adjust logic layout dnd style

-   [#175](https://github.com/worktile/plait/pull/175) [`00fdc81`](https://github.com/worktile/plait/commit/00fdc814914a7a1051320c3368e61b468e04fa05) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - refactor: change MindmapQueries export

*   [#165](https://github.com/worktile/plait/pull/165) [`a4a54ce`](https://github.com/worktile/plait/commit/a4a54ce81bd8792ccb093a0cd4255c9c331ba531) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - adjust idented layout dnd style of mindmap

-   [#165](https://github.com/worktile/plait/pull/165) [`a4a54ce`](https://github.com/worktile/plait/commit/a4a54ce81bd8792ccb093a0cd4255c9c331ba531) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix: add hasSameParentOriginChildren judge

## 0.0.46

### Patch Changes

-   [#172](https://github.com/worktile/plait/pull/172) [`d4956b0`](https://github.com/worktile/plait/commit/d4956b07e6a2c4b90c82083dad544df3bc31f5bc) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - feat: add setMindmapLayout function and MindmapTransforms

## 0.0.45

### Patch Changes

-   [#170](https://github.com/worktile/plait/pull/170) [`f3d287e`](https://github.com/worktile/plait/commit/f3d287ee8da99afb2678f41873683f69ef64bebd) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - Add debounceTime to resolve the problem that last insert text operation cannot be subscribed.

*   [#169](https://github.com/worktile/plait/pull/169) [`e4db480`](https://github.com/worktile/plait/commit/e4db4805617c34d92726bbde2baf31171bbcf2ca) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - feat: add MindmapQueries export and add getAvailableSubLayoutsByElement function

## 0.0.44

### Patch Changes

-   [#162](https://github.com/worktile/plait/pull/162) [`653b8d4`](https://github.com/worktile/plait/commit/653b8d422aad64ec27baa8d134e055bd626f43fe) Thanks [@Maple13](https://github.com/Maple13)! - integrate board options parameters

## 0.0.43

### Patch Changes

-   [#158](https://github.com/worktile/plait/pull/158) [`6e55b69`](https://github.com/worktile/plait/commit/6e55b69e0d8aa3f6cd3eb324d6e1cbf1d9ee6ec3) Thanks [@WBbug](https://github.com/WBbug)! - change verticalGap and horizontalGap

*   [#155](https://github.com/worktile/plait/pull/155) [`0f5cde0`](https://github.com/worktile/plait/commit/0f5cde0be6a51a1faf67480e7805ac450b02c548) Thanks [@Maple13](https://github.com/Maple13)! - limit the scroll area

-   [#161](https://github.com/worktile/plait/pull/161) [`0a5605c`](https://github.com/worktile/plait/commit/0a5605ca75bdc461ee194deade2c0c9bee232563) Thanks [@WBbug](https://github.com/WBbug)! - stopPropagation when click quickInsert

*   [#156](https://github.com/worktile/plait/pull/156) [`7fc510a`](https://github.com/worktile/plait/commit/7fc510a642be703b1234d1ea6aa89f0e23cb7905) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix: add hasSameParentOriginChildren judge

## 0.0.42

### Patch Changes

-   [#144](https://github.com/worktile/plait/pull/144) [`570c3ca`](https://github.com/worktile/plait/commit/570c3ca653fce3df8096a65529fca56a57dcb247) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - remove draw link underlin when dnd and adjust quick insert icon space of mindmap

*   [#147](https://github.com/worktile/plait/pull/147) [`aa995c3`](https://github.com/worktile/plait/commit/aa995c33f6aa9f748e3d32aeee896c57eb9e1a4f) Thanks [@WBbug](https://github.com/WBbug)! - change default color array, inherit node when create new node

-   [#151](https://github.com/worktile/plait/pull/151) [`b225f06`](https://github.com/worktile/plait/commit/b225f06353931ab57fe3b51d8ffe0c22c9b33faa) Thanks [@WBbug](https://github.com/WBbug)! - add default shape, set shape when create node

*   [#148](https://github.com/worktile/plait/pull/148) [`8da92c1`](https://github.com/worktile/plait/commit/8da92c190febbac6a342b41c4290ebd30d0366ee) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix draw link root node line incorrect

-   [#150](https://github.com/worktile/plait/pull/150) [`4d429a9`](https://github.com/worktile/plait/commit/4d429a9b172c447d0696a8862b78ec1310cd8aaa) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix root node line overflow and quick insert line overflow of mindmap

*   [#145](https://github.com/worktile/plait/pull/145) [`055e265`](https://github.com/worktile/plait/commit/055e265e67bbe03f4d1bd5739e6fb7c384b05af9) Thanks [@WBbug](https://github.com/WBbug)! - use getCorrectLayoutByElement to get layout

## 0.0.41

### Patch Changes

-   [#140](https://github.com/worktile/plait/pull/140) [`9753374`](https://github.com/worktile/plait/commit/9753374477d2406b471fc0e5fbaf81e76a9ce243) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix: restore performance optimize

*   [#137](https://github.com/worktile/plait/pull/137) [`1ac0654`](https://github.com/worktile/plait/commit/1ac0654111c98bc185d2e1b45861987a6e02e512) Thanks [@WBbug](https://github.com/WBbug)! - add offset when number more than 10 or equal to 1

-   [#135](https://github.com/worktile/plait/pull/135) [`0d94d19`](https://github.com/worktile/plait/commit/0d94d19aeb17fd29271c4d6494cc577397c56081) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support shortcut(Space) enter edit and cursor is end, support clear node text when press input keyboard

*   [#136](https://github.com/worktile/plait/pull/136) [`996c96f`](https://github.com/worktile/plait/commit/996c96f63e2acc83253500b3970d8082db163ad0) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix: fix collapsed tab insert error

-   [#139](https://github.com/worktile/plait/pull/139) [`0232dcb`](https://github.com/worktile/plait/commit/0232dcb3bc8ea02882b9319359fcf3ae7017fde5) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - support richtext paste function

## 0.0.40

### Patch Changes

-   [#132](https://github.com/worktile/plait/pull/132) [`f320419`](https://github.com/worktile/plait/commit/f32041981d7a249342e386328fb645f93b8e261f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - mindmap node rerender performance optimize

-   [#128](https://github.com/worktile/plait/pull/128) [`831a548`](https://github.com/worktile/plait/commit/831a5481761558115c9f3f23a3483d28a549f56d) Thanks [@WBbug](https://github.com/WBbug)! - clear zoom effect

*   [#129](https://github.com/worktile/plait/pull/129) [`241e9fa`](https://github.com/worktile/plait/commit/241e9fa6abc078e1d12fb6cd60a6dd84c8302ecf) Thanks [@WBbug](https://github.com/WBbug)! - get dom attribute after render

-   [#127](https://github.com/worktile/plait/pull/127) [`5e8a56b`](https://github.com/worktile/plait/commit/5e8a56bd82692e2ccb2ea28f7c2629a542429f30) Thanks [@WBbug](https://github.com/WBbug)! - redraw arrow

*   [#125](https://github.com/worktile/plait/pull/125) [`b4898bb`](https://github.com/worktile/plait/commit/b4898bb868d068232fc3f0a153d7cf8ccab5f88c) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix quick insert icon offset of mindmap

## 0.0.39

### Patch Changes

-   [#120](https://github.com/worktile/plait/pull/120) [`dd9de02`](https://github.com/worktile/plait/commit/dd9de0292e117b36a200a2a0659927974f1f4f5f) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - adjust quick insert cross icon and extend icon border width

*   [#123](https://github.com/worktile/plait/pull/123) [`f3b5362`](https://github.com/worktile/plait/commit/f3b53621e299d185d7b9f817febc979a7e2e4bfc) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix keydown enter key remove extend icon

-   [#122](https://github.com/worktile/plait/pull/122) [`64e428d`](https://github.com/worktile/plait/commit/64e428d77a655891744efc043824875410babd57) Thanks [@Ashy6](https://github.com/Ashy6)! - moveMode and drop to disable node

*   [#121](https://github.com/worktile/plait/pull/121) [`49c0148`](https://github.com/worktile/plait/commit/49c0148bc7c2981fcadf127879570899fb45c5be) Thanks [@WBbug](https://github.com/WBbug)! - add detectResult judge

## 0.0.38

### Patch Changes

-   [#108](https://github.com/worktile/plait/pull/108) [`bfa68a2`](https://github.com/worktile/plait/commit/bfa68a20da1fff6a52dd8c0c7fdb8da7b8b0153a) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix not disable mindmap quick insert when readonly

*   [#116](https://github.com/worktile/plait/pull/116) [`7215a6c`](https://github.com/worktile/plait/commit/7215a6caaa7835f45e085e2ddf8300ebe34fc049) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix dnd idented layout style of mindmap

-   [#107](https://github.com/worktile/plait/pull/107) [`9c8ae63`](https://github.com/worktile/plait/commit/9c8ae63f846983311a9abf5d09b76c5fca8a5c06) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix left layout dnd style of mindmap

*   [#118](https://github.com/worktile/plait/pull/118) [`7aa4fa9`](https://github.com/worktile/plait/commit/7aa4fa93ef772179e7b135cf167be052832c8c6d) Thanks [@Maple13](https://github.com/Maple13)! - text node adds level class

-   [`c8170e8`](https://github.com/worktile/plait/commit/c8170e8884fcd012849263641d64f6cff9b15ca3) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct node isEditable status error

*   [`68cfa48`](https://github.com/worktile/plait/commit/68cfa485383f40851ec89f9229a167c37905c7a0) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add delete handle for selected mindmap node

-   [#115](https://github.com/worktile/plait/pull/115) [`ed06d70`](https://github.com/worktile/plait/commit/ed06d70da89b10a79f163359516ab5a0ba2652ad) Thanks [@Maple13](https://github.com/Maple13)! - modify the default strokeColor when the root node shape is roundRectangle

## 0.0.37

### Patch Changes

-   [#105](https://github.com/worktile/plait/pull/105) [`f408d0a`](https://github.com/worktile/plait/commit/f408d0a598b13bd74f8a0180dfcdcd18259b996c) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix idented layout dnd style of mindmap

*   [#102](https://github.com/worktile/plait/pull/102) [`561b0ed`](https://github.com/worktile/plait/commit/561b0ed44a2581ae229303146c8e32454936a30a) Thanks [@WBbug](https://github.com/WBbug)! - remove math.round

## 0.0.36

### Patch Changes

-   [#96](https://github.com/worktile/plait/pull/96) [`87fca5f`](https://github.com/worktile/plait/commit/87fca5f0047ab44af60fd914c5da676ae8b9038e) Thanks [@WBbug](https://github.com/WBbug)! - change indented-link curve

*   [#98](https://github.com/worktile/plait/pull/98) [`19c356e`](https://github.com/worktile/plait/commit/19c356ea857346476a1b5e404b1e1ded96b62a9a) Thanks [@WBbug](https://github.com/WBbug)! - use math.round draw link

-   [#95](https://github.com/worktile/plait/pull/95) [`673d3ba`](https://github.com/worktile/plait/commit/673d3bae0b553f5d18ae7b5dd97e5d0b4c1efe7a) Thanks [@WBbug](https://github.com/WBbug)! - fix create node error

*   [`3e21041`](https://github.com/worktile/plait/commit/3e2104178b8f98dce181da3ef864f7f84c57d65f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add min width for new node;auto enter edit status when press keyboard

-   [#94](https://github.com/worktile/plait/pull/94) [`39f6c59`](https://github.com/worktile/plait/commit/39f6c59e6145a97f35f320dd593c2a9aac00346f) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - support standrad layout quick insert

*   [#100](https://github.com/worktile/plait/pull/100) [`34fdccb`](https://github.com/worktile/plait/commit/34fdccb6f11d9c20a8c320acfbbcda7937aa997e) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix edit node hover event available

-   [#97](https://github.com/worktile/plait/pull/97) [`2dfa72a`](https://github.com/worktile/plait/commit/2dfa72abfd4bb2fb123169b3f87b644cb2db09ca) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix root node quick insert icon out of position

## 0.0.35

### Patch Changes

-   [`bebc7c3`](https://github.com/worktile/plait/commit/bebc7c343e3f3ecceecc4f1bcfc58fca87dfee4f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - layout gap refactor, support indented layout level gap/extend width/extend height of indented layout

*   [#88](https://github.com/worktile/plait/pull/88) [`63baaeb`](https://github.com/worktile/plait/commit/63baaeb931539babcfe7b81d14f11879e19009ab) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - implement quick insert node function of mindmap

-   [#90](https://github.com/worktile/plait/pull/90) [`b012c7a`](https://github.com/worktile/plait/commit/b012c7a32127b08862555b4afbebf4a23e084dfa) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - root node support quick insert of mindmap

## 0.0.34

### Patch Changes

-   [#85](https://github.com/worktile/plait/pull/85) [`39d10fd`](https://github.com/worktile/plait/commit/39d10fd29a2b60dc454d5a3f1e0ef2b3ba11b0a3) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - fix mindmap quick insert error

*   [#86](https://github.com/worktile/plait/pull/86) [`6462049`](https://github.com/worktile/plait/commit/6462049b87a0024182b152edd8d7275bbff26b5b) Thanks [@WBbug](https://github.com/WBbug)! - fix horizontalLayout judge ,add not indentedLayout

-   [#87](https://github.com/worktile/plait/pull/87) [`97e12d9`](https://github.com/worktile/plait/commit/97e12d9b5a3c04a3d5d2eff51a2be7dc45974d34) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - support quick insert of mindmap indented layout

## 0.0.33

### Patch Changes

-   [#82](https://github.com/worktile/plait/pull/82) [`12f2481`](https://github.com/worktile/plait/commit/12f2481a0a193d88720cf9c54ae0390c11746302) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - implement quick insert of mindmap

*   [`52fb467`](https://github.com/worktile/plait/commit/52fb46795638ebc8447c9d31ae9918f4d9cbe48c) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - resolve expand node or collapsed node lose selection problem

## 0.0.32

### Patch Changes

-   [`094d50f`](https://github.com/worktile/plait/commit/094d50f2caecd56521d4c01b9c10d85a6d59e75a) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - use richtext keydown handle node exit edit action

*   [#81](https://github.com/worktile/plait/pull/81) [`955d760`](https://github.com/worktile/plait/commit/955d760feb215a41927b73d2c5163fa5977f6773) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - open collapsed parent node when insert node

-   [#80](https://github.com/worktile/plait/pull/80) [`ce86b99`](https://github.com/worktile/plait/commit/ce86b99afb2773fc8618eea2c877045d9fdf926f) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - support tab key to add continuously

*   [#79](https://github.com/worktile/plait/pull/79) [`eb1fb40`](https://github.com/worktile/plait/commit/eb1fb4075b805783f9e17feca51f879ac9a6e179) Thanks [@WBbug](https://github.com/WBbug)! - add rightNodeCount property, change logic layout insert and delete Node logic

-   [#78](https://github.com/worktile/plait/pull/78) [`41c88ad`](https://github.com/worktile/plait/commit/41c88ad9a1b63ed94c4430c87ec3854ffe6c6173) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - remove empty text node when exec undo and delete node element when destroy

## 0.0.31

### Patch Changes

-   [`d9aff21`](https://github.com/worktile/plait/commit/d9aff21815af7e6ffabff14c0f122b8a476cec74) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getBranchLayouts: get layout array from element and it's parent element

*   [`57da5cb`](https://github.com/worktile/plait/commit/57da5cbc89e8933e128a469cadb61efdf3b1f468) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getBranchDirectionsByLayouts: get all directions of current branch

## 0.0.30

### Patch Changes

-   [#75](https://github.com/worktile/plait/pull/75) [`193d5ec`](https://github.com/worktile/plait/commit/193d5ec797d181a81885fe56d42046d7407a2881) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - remove root property when copy root node

*   [`af2ba53`](https://github.com/worktile/plait/commit/af2ba53fa66872048aad595db91eb9a43d563cc9) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - modify getAvailableSubLayouts logic - use direction include

## 0.0.29

### Patch Changes

-   [`81cf183`](https://github.com/worktile/plait/commit/81cf18386891d22fdaac1dc200f57732c8d4bcc2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add DRAG_MOVE_BUFFER distance before begin drag

*   [#76](https://github.com/worktile/plait/pull/76) [`15e8202`](https://github.com/worktile/plait/commit/15e8202b5ab141b48194b96bedda8802d370b7e8) Thanks [@WBbug](https://github.com/WBbug)! - use getCorrectLayoutByElement to draw extend

## 0.0.28

### Patch Changes

-   [#73](https://github.com/worktile/plait/pull/73) [`d2b1ecd`](https://github.com/worktile/plait/commit/d2b1ecd2c321473143db5cd46c2640128a5094c0) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - disable mindmap insert node and delete node when readonly

*   [#71](https://github.com/worktile/plait/pull/71) [`1dfba82`](https://github.com/worktile/plait/commit/1dfba829fce633ecaa07167d23b82dd9029d3953) Thanks [@WBbug](https://github.com/WBbug)! - change vGap, change indent-link left judge

-   [#74](https://github.com/worktile/plait/pull/74) [`0ac6fbf`](https://github.com/worktile/plait/commit/0ac6fbf482414af728c0069d589e113eb1f79645) Thanks [@Maple13](https://github.com/Maple13)! - read-only hover does not show the collapse button

## 0.0.27

### Patch Changes

-   [`ad2d7de`](https://github.com/worktile/plait/commit/ad2d7dee5e97b3bb6183f20dfb2e079cc9799694) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - root node font-size default 18px

## 0.0.26

### Patch Changes

-   [`89359a9`](https://github.com/worktile/plait/commit/89359a92deed1981204d819c347dd581ba223793) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - remove topic font-size hand color

*   [#70](https://github.com/worktile/plait/pull/70) [`43cd1e3`](https://github.com/worktile/plait/commit/43cd1e3849bc3a79339e76a5cb75b1bd5cfe98aa) Thanks [@WBbug](https://github.com/WBbug)! - fix logic horizon link break

-   [`2316531`](https://github.com/worktile/plait/commit/2316531793d76de3e4d8a200e39c2f228caf947b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - keydown preventDefault just selectedElements > 0 and special key

*   [#69](https://github.com/worktile/plait/pull/69) [`0c86941`](https://github.com/worktile/plait/commit/0c86941b03f0ba65666f035274545ea03032494d) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - add calc width by text function

## 0.0.25

### Patch Changes

-   [`a378e70`](https://github.com/worktile/plait/commit/a378e70eef8e87b98a02119abfd38a5ea6aad9d6) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add plait-board-attached when dnd to avoid selection lose

*   [#68](https://github.com/worktile/plait/pull/68) [`a184e8f`](https://github.com/worktile/plait/commit/a184e8feb0d1a8d6b9e1e0e6df87043c685b50f4) Thanks [@WBbug](https://github.com/WBbug)! - change horizon under indentedLayout link

-   [`a67093e`](https://github.com/worktile/plait/commit/a67093edf0f92d75d9eaf0c569ef60f4a2ab558e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - keydown preventDefault just selectedElements > 0

*   [`3012309`](https://github.com/worktile/plait/commit/3012309578e1b8e17413d556862dd1021049583e) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - just keydown preventDefault and stopProgapation when selectedElements length > 0

## 0.0.24

### Patch Changes

-   [#63](https://github.com/worktile/plait/pull/63) [`83575fd`](https://github.com/worktile/plait/commit/83575fd9cb370025fa13578474443d5600569faa) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - mindmap support paste text

*   [#67](https://github.com/worktile/plait/pull/67) [`d427227`](https://github.com/worktile/plait/commit/d427227f7fd151b6d2a38bd853a1f4a787f81e8c) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - implement mindmap cut function

## 0.0.23

### Patch Changes

-   [#62](https://github.com/worktile/plait/pull/62) [`e8ad96e`](https://github.com/worktile/plait/commit/e8ad96e65638a15fc8287d6f02451790c10dd5c8) Thanks [@Maple13](https://github.com/Maple13)! - fix mask position rendering error under different layouts

*   [#60](https://github.com/worktile/plait/pull/60) [`8eb2505`](https://github.com/worktile/plait/commit/8eb2505faac9ec55da57b0d28f8d3067e5e6c506) Thanks [@WBbug](https://github.com/WBbug)! - fix link break

-   [#59](https://github.com/worktile/plait/pull/59) [`3534ba5`](https://github.com/worktile/plait/commit/3534ba58177988cfde4575f488723b722570f2e0) Thanks [@aaaaaajie](https://github.com/aaaaaajie)! - implement mindmap copy and paste

*   [`1baa7f5`](https://github.com/worktile/plait/commit/1baa7f57682ad1a06ba5d336b00a9e091b94a153) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - prevent exit edit when node isComposing equals true

-   [#58](https://github.com/worktile/plait/pull/58) [`8da4f27`](https://github.com/worktile/plait/commit/8da4f27f814af45dab9fe7f1d6e977004f2db1ec) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add getCorrectLayoutByElement

*   [`d8b9bea`](https://github.com/worktile/plait/commit/d8b9bea5e6f1d62ecdb6aa7b7ba270f6abb30dc8) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - correct foreignObject buffer space

## 0.0.22

### Patch Changes

-   [#56](https://github.com/worktile/plait/pull/56) [`3fe5f0d`](https://github.com/worktile/plait/commit/3fe5f0de1d2224f042fcbdada4b1b54b80bd471d) Thanks [@Maple13](https://github.com/Maple13)! - feat: add plait/core override function

*   [#52](https://github.com/worktile/plait/pull/52) [`966e15f`](https://github.com/worktile/plait/commit/966e15fdf23db86629d7b7d77b69397cd3500f7e) Thanks [@Maple13](https://github.com/Maple13)! - feat(mindmap): display the expand and collapse buttons when hovering the node

## 0.0.21

### Patch Changes

-   [#50](https://github.com/worktile/plait/pull/50) [`5079b01`](https://github.com/worktile/plait/commit/5079b0142f4c62ff8a4b6daea46be3a210568ae8) Thanks [@WBbug](https://github.com/WBbug)! - redraw indented link, add isChildRight, isChildUp function

## 0.0.20

### Patch Changes

-   [#48](https://github.com/worktile/plait/pull/48) [`04fbfae`](https://github.com/worktile/plait/commit/04fbfae4a9638abe2f6d56ba57c7f351b18984ae) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - update buffer

## 0.0.19

### Patch Changes

-   [`dc0a5dd`](https://github.com/worktile/plait/commit/dc0a5dd4016abf1ed339c414d2d9b8c6b3491b5d) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - mouseup rename globalMouseup and complete withSelection

*   [#40](https://github.com/worktile/plait/pull/40) [`38e170f`](https://github.com/worktile/plait/commit/38e170f5b2fb8e0af11672c2860cc49e833f6be0) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - fix blur text error

-   [#41](https://github.com/worktile/plait/pull/41) [`b48a91e`](https://github.com/worktile/plait/commit/b48a91e207aa8624ab5c1475612d84101a75042d) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - sync richtext when mandmap node change and merge width change operation

*   [#47](https://github.com/worktile/plait/pull/47) [`e2bd891`](https://github.com/worktile/plait/commit/e2bd8916fbadaf0fd9bf97ede6bd3a0dd87208d1) Thanks [@WBbug](https://github.com/WBbug)! - change stroke-width, redraw extendLine and arrow

-   [#43](https://github.com/worktile/plait/pull/43) [`7c1cec1`](https://github.com/worktile/plait/commit/7c1cec19cbaf35bc77eb85f53c78680eb29653a5) Thanks [@Ashy6](https://github.com/Ashy6)! - support getAvailableSubLayouts

*   [#42](https://github.com/worktile/plait/pull/42) [`a9396a6`](https://github.com/worktile/plait/commit/a9396a6537d057a1934b02df719394a693e36fc8) Thanks [@WBbug](https://github.com/WBbug)! - change drawLink line,fix vertical extend position

## 0.0.16

### Patch Changes

-   [#38](https://github.com/worktile/plait/pull/38) [`75d140d`](https://github.com/worktile/plait/commit/75d140d29b08c31d693d5acd99a2c19a40b56eb8) Thanks [@Ashy6](https://github.com/Ashy6)! - new node shape extaned father node shape

*   [#35](https://github.com/worktile/plait/pull/35) [`a3a81f3`](https://github.com/worktile/plait/commit/a3a81f31955145bfb555b04be9f6ae62ee070d88) Thanks [@WBbug](https://github.com/WBbug)! - add left extend icon

## 0.0.15

### Patch Changes

-   [`a8ff74a`](https://github.com/worktile/plait/commit/a8ff74ab27602faca43131a4d436078e2e524bc1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - refactor layout type

## 0.0.14

### Patch Changes

-   [`4ec3796`](https://github.com/worktile/plait/commit/4ec3796d3c4edb0c34b8c4194e669eba824b2209) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename active g and init active g

*   [#33](https://github.com/worktile/plait/pull/33) [`bc533d0`](https://github.com/worktile/plait/commit/bc533d059a4f6b7e5f3674f1a0dc21c444ac8925) Thanks [@huanhuanwa](https://github.com/huanhuanwa)! - add plaitAllowClearBoard determine whether to allow the board to be cleared

## 0.0.13

### Patch Changes

-   [#27](https://github.com/worktile/plait/pull/27) [`672a29d`](https://github.com/worktile/plait/commit/672a29ddaa410724a983b0a93e1e978163bdd8b8) Thanks [@MissLixf](https://github.com/MissLixf)! - support active last node when delete a node

*   [#32](https://github.com/worktile/plait/pull/32) [`6e752b2`](https://github.com/worktile/plait/commit/6e752b22f1cd5913913f0df5731a67ecc1976f05) Thanks [@MissLixf](https://github.com/MissLixf)! - remove HAS_SELECTED_MINDMAP and HAS_SELECTED_MINDMAP_ELEMENT, use SELECTED_MINDMAP_NODES

-   [`7fef390`](https://github.com/worktile/plait/commit/7fef390952899b55f8ea6c874c39f4b08832db50) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - rename selected-elements and add getSelectedMindmapElements

*   [`b00f904`](https://github.com/worktile/plait/commit/b00f90439c14a5e8fcf772f192433925f0808cd2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update selected elements asap

-   [#31](https://github.com/worktile/plait/pull/31) [`b294a30`](https://github.com/worktile/plait/commit/b294a3011f4312cc89f27ed84632fe8a458a049b) Thanks [@WBbug](https://github.com/WBbug)! - fix underlineShape y value

*   [#30](https://github.com/worktile/plait/pull/30) [`8e14d72`](https://github.com/worktile/plait/commit/8e14d728562b52570203ddc221215fc75470fb93) Thanks [@WBbug](https://github.com/WBbug)! - support upward layout

## 0.0.12

### Patch Changes

-   [`0065e89`](https://github.com/worktile/plait/commit/0065e8961a7c21f7ff5bceeae2f591099b17184f) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - support clear selection when mousedown ouside of board

## 0.0.11

### Patch Changes

-   [`43a80ee`](https://github.com/worktile/plait/commit/43a80ee3603bc27fffc1af76f22849ea2de4bf64) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - should not remove all ranges

*   [`977c837`](https://github.com/worktile/plait/commit/977c83764581056f80dc0065103b4285a6135585) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - export layout utils

## 0.0.10

### Patch Changes

-   [#26](https://github.com/worktile/plait/pull/26) [`2c26069`](https://github.com/worktile/plait/commit/2c26069240cf262631b98f80ce251e4c88c4c642) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update node link and layout interface

## 0.0.9

### Patch Changes

-   [#25](https://github.com/worktile/plait/pull/25) [`de68a9e`](https://github.com/worktile/plait/commit/de68a9eaab6cc6c778c0f1c8184663901fe24002) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add indented layout and draw indented layout link

## 0.0.6

### Patch Changes

-   [#22](https://github.com/worktile/plait/pull/22) [`fb730c3`](https://github.com/worktile/plait/commit/fb730c30f89e49ffbcf0cde6a21132334cd211b1) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - add shape property for mindmap element and support underline and round rectangle

*   [#19](https://github.com/worktile/plait/pull/19) [`8abdd2f`](https://github.com/worktile/plait/commit/8abdd2f77827bc30e4df4ac8c4ed31ae05bf0d6f) Thanks [@Maple13](https://github.com/Maple13)! - feat(mindmap): add selected node set

## 0.0.5

### Patch Changes

-   [#18](https://github.com/worktile/plait/pull/18) [`b9d4198`](https://github.com/worktile/plait/commit/b9d4198f7f6f4c2281c8fac3fa22ce3610dee0af) Thanks [@Maple13](https://github.com/Maple13)! - fix(mindmap): add read-only processing

## 0.0.4

### Patch Changes

-   [`c35e105`](https://github.com/worktile/plait/commit/c35e10532e7dd13315e481a28834f180699f34d2) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update styles

## 0.0.3

### Patch Changes

-   [`844f26d`](https://github.com/worktile/plait/commit/844f26dcc878949e5fe08ec0c5431e3215d2133b) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - update dependence package name

## 0.0.2

### Patch Changes

-   first release
