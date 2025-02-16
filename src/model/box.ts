import { ExcalidrawRectangleElement } from "@excalidraw/excalidraw/types/element/types";

export interface IBox {
  id: string;
  label: string;
  strokeColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Default: IBox = {
  id: "",
  label: "",
  strokeColor: "",
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

export function fromRectangleElement(
  element: ExcalidrawRectangleElement,
): IBox {
  return {
    id: element.id,
    label: element.customData?.label || "",
    strokeColor: element.strokeColor,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };
}
