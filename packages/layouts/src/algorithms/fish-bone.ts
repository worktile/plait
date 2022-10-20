import { BoundingBox, LayoutNode } from '../interfaces/node';
import { LayoutOptions } from '../types';

function layout(root: LayoutNode, options: LayoutOptions) {
    firstWalk(root, options);
    secondWalk(root, options);
    return root;
}

export function firstWalk(mainNode: LayoutNode, options: LayoutOptions) {
    let startLeft = mainNode.width;
    let previousBone: LayoutNode | null = null;
    let extremeRightBoundingBox: BoundingBox | null = null;
    let extremeRight: LayoutNode | null = null;
    mainNode.children.forEach((boneNode, boneNodeIndex) => {
        if (boneNode.children.length > 0) {
            boneNode.children[boneNode.children.length - 1].children.length > 0 && firstWalk(boneNode.children[boneNode.children.length - 1], options);
            if (!extremeRight) {
                extremeRight = boneNode.children[boneNode.children.length - 1];
            } else {
                const bb = boneNode.children[boneNode.children.length - 1].getBoundingBox();
                const extremeRightBoundingBox = extremeRight.getBoundingBox();
                if (extremeRightBoundingBox.left + extremeRightBoundingBox.width < bb.left + boneNode.width) {
                    extremeRight = boneNode.children[boneNode.children.length - 1];
                }
            }
            for (let index = boneNode.children.length - 2; index >= 0; index--) {
                const secondBoneNode = boneNode.children[index];
                secondBoneNode.children.length > 0 && firstWalk(secondBoneNode, options);
                const previsous = boneNode.children[index + 1];
                // secondBoneNode.y = previsous.y + previsous.height;
                // secondBoneNode.x = previsous.x + secondBoneNode.height * tan30;
                const previousBoundingBox = previsous.getBoundingBox();
                const secondBoneBoundingBox = secondBoneNode.getBoundingBox();
                console.log(secondBoneNode, 'secondBoneNode translate', previsous, 'previsous');
                secondBoneNode.translate(previsous.x + secondBoneBoundingBox.height * tan30, previousBoundingBox.bottom);
                // const previousBoundingBox = previsous.getBoundingBox();
                // const secondBoneBoundingBox = secondBoneNode.getBoundingBox();
                const extremeRightBoundingBox = extremeRight && extremeRight.getBoundingBox();
                if (extremeRightBoundingBox && extremeRightBoundingBox.left + extremeRightBoundingBox.width < secondBoneBoundingBox.left + secondBoneBoundingBox.width) {
                    extremeRight = secondBoneNode;
                }
            }
            const firstChildBoundingBox = boneNode.children[0].getBoundingBox();
            boneNode.y = firstChildBoundingBox.top + firstChildBoundingBox.height;
            boneNode.x = firstChildBoundingBox.left - boneNode.width / 2;
        }
        const boneBoundingBox = boneNode.getBoundingBox();
        const extremeRightBoundingBox = extremeRight && extremeRight.getBoundingBox();
        if (extremeRightBoundingBox === null || extremeRightBoundingBox.left + extremeRightBoundingBox.width < boneBoundingBox.left + boneBoundingBox.width) {
            extremeRight = boneNode;
        }
        if (previousBone && boneNodeIndex % 2 === 1) {
            const previousBoneLineX = getBoneLineX(previousBone);
            const boneLineX = getBoneLineX(boneNode);
            const previousBoneShfit = Math.abs(Math.min(previousBoneLineX, previousBone.x));
            const boneShfit = Math.abs(Math.min(boneLineX, boneNode.x));

            previousBone.translate(startLeft + previousBoneShfit, mainNode.height / 2);
            boneNode.translate(startLeft + boneShfit, mainNode.height / 2);

            const _previousBoneLineX = getBoneLineX(previousBone);
            const _boneLineX = getBoneLineX(boneNode);
            if (_boneLineX > _previousBoneLineX && _boneLineX - _previousBoneLineX > 30) {
                previousBone.translate(_boneLineX - _previousBoneLineX - 30, 0);
            } else {
                boneNode.translate(30 - (_boneLineX - _previousBoneLineX), 0);
            }

            // index even toUp
            previousBone.eachNode(node => {
                node.y = node.y - (node.y - 0) * 2 - node.height;
                node.up = true;
            });
            previousBone.translate(0, previousBone.height);
            const extremeRightBoundingBox = extremeRight && extremeRight.getBoundingBox();
            if (extremeRightBoundingBox) {
                startLeft = extremeRightBoundingBox.left + extremeRightBoundingBox.width + 30;
            }
        }
        if (boneNodeIndex % 2 === 0 && boneNodeIndex === mainNode.children.length - 1) {
            const boneLineX = getBoneLineX(boneNode);
            const boneShfit = Math.abs(Math.min(boneLineX, boneNode.x));
            boneNode.translate(startLeft + boneShfit, mainNode.height / 2);

            // index even toUp
            // boneNode.eachNode(node => {
            //     node.y = node.y - (node.y - 0) * 2 - node.height;
            //     node.up = true;
            // });
            // boneNode.translate(0, boneNode.height);
        }
        previousBone = boneNode;
    });
    const mainNodeBoundingBox = mainNode.getBoundingBox();
    mainNode.translate(0, Math.abs(mainNodeBoundingBox.top));
    return mainNode;
}

export function secondWalk(mainNode: LayoutNode, options: LayoutOptions) {
    
}

export function getBoneBoundingBox(bone: LayoutNode) {}

export function getBoneHorizontalDistance(boneNode: LayoutNode) {
    return (boneNode.y + boneNode.vGap) * tan30;
}

export const tan30 = Math.tan((Math.PI * 30) / 180);

export function getBoneLineX(boneNode: LayoutNode) {
    const boneHorizontalDistance = getBoneHorizontalDistance(boneNode);
    const boneLineX = boneNode.x + boneNode.width / 2 - boneHorizontalDistance;
    return boneLineX;
}

export const fishBoneLayout = { layout };
