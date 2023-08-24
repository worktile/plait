import { Path, PlaitBoard, Point, Transforms } from "@plait/core";

export const resizeLine = (board: PlaitBoard, points: [Point, Point], path: Path) => {
    const newProperties = { points };
    Transforms.setNode(board, newProperties, path);
};