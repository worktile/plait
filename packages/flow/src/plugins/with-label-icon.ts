import { PlaitBoard } from "@plait/core";
import { LabelIconItem } from "../interfaces/icon";
import { FlowElement } from "../interfaces/element";
import { RenderComponentRef } from "@plait/common";

export interface PlaitFlowLabelIconBoard {
    renderLabelIcon: (container: Element | DocumentFragment, props: LabelIconProps) => RenderComponentRef<LabelIconProps>;
}

export const withLabelIcon = <T extends PlaitBoard = PlaitBoard>(board: T) => {
    const newBoard = board as T & PlaitFlowLabelIconBoard;

    newBoard.renderLabelIcon = (container: Element | DocumentFragment, props: LabelIconProps) => {
        throw new Error('No implementation for renderLabeIcon method.');
    };
    return newBoard;
};

export interface LabelIconProps {
    board: PlaitBoard;
    iconItem: LabelIconItem;
    element: FlowElement;
    fontSize: number;
}