import { PlaitBoard, Point, RectangleClient } from "@plait/core";
import { MindElement } from "../../interfaces/element";
import { EmojiData } from "../../interfaces/element-data";
import { PlaitMindBoard } from "../../plugins/with-extend-mind";
import { getRectangleByNode } from "./node";
import { NodeSpace } from "../space/node-space";
import { getEmojisWidthHeight } from "../../plugins/emoji/emoji";

export function getEmojiRectangle(board: PlaitMindBoard, element: MindElement<EmojiData>): RectangleClient {
    let { x, y } = getRectangleByNode(MindElement.getNode(element));
    x = x + NodeSpace.getEmojiLeftSpace(board, element);
    const { width, height } = getEmojisWidthHeight(board, element);
    return {
        x,
        y,
        width,
        height
    };
}

export function getEmojiForeignRectangle(board: PlaitMindBoard, element: MindElement<EmojiData>): RectangleClient {
    let { x, y } = getRectangleByNode(MindElement.getNode(element));
    x = x + NodeSpace.getEmojiLeftSpace(board, element);
    const { width, height } = getEmojisWidthHeight(board, element);
    return {
        x,
        y,
        width,
        height: height + NodeSpace.getEmojiTopSpace(element) * 2
    };
}

export const isHitEmojis = (board: PlaitBoard, element: MindElement<EmojiData>, point: Point) => {
    return RectangleClient.isHit(RectangleClient.toRectangleClient([point, point]), getEmojiRectangle(board as PlaitMindBoard, element));
};
