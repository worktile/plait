# @plait/common

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
