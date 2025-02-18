import { ExcalidrawRectangleElement } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { Button, Divider, Empty, Input } from "antd";
import cls from "classnames";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { ImageID } from "../../config";
import { ILV } from "../../model/antd.ts";
import { randomColor } from "../../helper/color.ts";
import { fromRectangleElement, IBox } from "../../model/box.ts";
import BoxForm from "../BoxForm";
import FloatList from "../FloatList";
import styles from "./style.module.scss";

export interface IBoxListProps {
  api?: ExcalidrawImperativeAPI;
  options: ILV<IBox["label"]>[];
  onReport?: (boxes: IBox[]) => void;
}

export default function BoxList({
  api,
  options,
  onReport,
}: IBoxListProps): ReactElement {
  const [strokeColor, _setStrokeColor] = useState<string>("#000000");
  const [boxes, setBoxes] = useState<IBox[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const setStrokeColor = useCallback(
    (color: string) => {
      _setStrokeColor(color);
      if (api && api.getAppState().currentItemStrokeColor !== color) {
        api.updateScene({
          appState: {
            currentItemStrokeColor: color,
          },
        });
      }
    },
    [api],
  );

  const handleChange = useCallback(
    (id: ExcalidrawRectangleElement["id"], value: IBox) => {
      if (!api) {
        return;
      }

      const elements = api.getSceneElements();
      api.updateScene({
        elements: elements.map((element) => {
          if (element.id === id) {
            return {
              ...element,
              customData: {
                ...element.customData,
                label: value.label,
              },
              strokeColor: value.strokeColor,
              x: value.x,
              y: value.y,
              width: value.width,
              height: value.height,
            };
          }
          return element;
        }),
      });
    },
    [api],
  );

  const handleNormalize = useCallback((): IBox[] => {
    if (!api) {
      return [];
    }

    const elements = api.getSceneElements();

    const image = elements.find((i) => i.id === ImageID);
    if (!image) {
      return [];
    }

    const boxElements = elements.filter((i) => i.type === "rectangle");
    const nonBoxElements = elements.filter((i) => i.type !== "rectangle");

    const newBoxElements = boxElements
      .filter((element) => {
        let overWidth = false;
        if (element.x < 0) {
          const rightX = element.x + element.width;
          if (rightX < 0 || rightX > image.width) {
            overWidth = true;
          }
        }
        if (element.x > image.width) {
          return false;
        }

        if (element.y < 0) {
          const bottomY = element.y + element.height;
          if (bottomY < 0 || bottomY > image.height) {
            if (overWidth) {
              return false;
            }
          }
        }
        // noinspection RedundantIfStatementJS
        if (element.y > image.height) {
          return false;
        }

        return true;
      })
      .map((element) => {
        let x = element.x;
        let y = element.y;
        let width = element.width;
        let height = element.height;

        if (x < 0) {
          width += x;
          x = 0;
        }
        if (x + width > image.width) {
          width = image.width - x;
        }

        if (y < 0) {
          height += y;
          y = 0;
        }
        if (y + height > image.height) {
          height = image.height - y;
        }

        return {
          ...element,
          x,
          y,
          width,
          height,
        };
      })
      .filter((element) => element.width > 0 && element.height > 0);

    const boxes: IBox[] = newBoxElements
      .filter((i) => i.type === "rectangle")
      .map((i) => fromRectangleElement(i as ExcalidrawRectangleElement));

    api.updateScene({
      elements: [...nonBoxElements, ...newBoxElements],
    });

    return boxes;
  }, [api]);

  const handleFocus = useCallback(
    (id: ExcalidrawRectangleElement["id"]) => {
      if (!api) {
        return;
      }
      api.updateScene({
        appState: {
          selectedElementIds: { [id]: true },
        },
      });
    },
    [api],
  );

  const handleDelete = useCallback(
    (id: ExcalidrawRectangleElement["id"]) => {
      if (!api) {
        return;
      }
      const elements = api.getSceneElements();
      api.updateScene({
        elements: elements.filter((element) => element.id !== id),
      });
    },
    [api],
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    let lastBoxesCount = 0;

    const dispose = api.onChange((elements, appState) => {
      const boxes: IBox[] = elements
        .filter((i) => i.type === "rectangle" && !i.isDeleted)
        .map((element) =>
          fromRectangleElement(element as ExcalidrawRectangleElement),
        );

      if (lastBoxesCount !== boxes.length) {
        lastBoxesCount = boxes.length;
        setStrokeColor(randomColor());
      } else {
        setStrokeColor(appState.currentItemStrokeColor);
      }

      setBoxes(boxes);
      setSelectedIds(Object.keys(appState.selectedElementIds));
    });

    return () => {
      dispose();
    };
  }, [api, setStrokeColor]);

  const handleReport = useCallback(() => {
    const boxes = handleNormalize();
    onReport?.(boxes);
  }, [handleNormalize, onReport]);

  return (
    <FloatList className={styles.wrapper} position="right">
      <div className={styles.flex}>
        <Input
          className={styles.colorPicker}
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
        />
        <Button onClick={handleNormalize} disabled={boxes.length === 0}>
          Normalize
        </Button>
        <Button type="primary" onClick={handleReport}>
          Report
        </Button>
      </div>
      <Divider type="horizontal" />
      {boxes.length === 0 ? (
        <Empty description="No box has been drawn" />
      ) : undefined}
      {boxes.map((box) => {
        return (
          <div
            key={box.id}
            className={cls(
              styles.box,
              selectedIds.includes(box.id) ? styles.selected : undefined,
            )}
          >
            <BoxForm
              data-boxid={box.id}
              options={options}
              value={box}
              onChange={(v) => handleChange(box.id, v)}
              onFocus={() => handleFocus(box.id)}
              onDelete={() => handleDelete(box.id)}
            />
          </div>
        );
      })}
    </FloatList>
  );
}
