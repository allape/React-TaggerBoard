import { ExcalidrawRectangleElement } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { Button, Empty } from "antd";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { ImageID } from "../../config";
import { ILV } from "../../config/antd.ts";
import BoxForm, { IBox } from "../BoxForm";
import FloatList from "../FloatList";
import styles from "./style.module.scss";

export interface IBoxListProps {
  api?: ExcalidrawImperativeAPI;
  options: ILV<IBox["label"]>[];
}

export default function BoxList({ api, options }: IBoxListProps): ReactElement {
  const [boxes, setBoxes] = useState<IBox[]>([]);

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

  const handleNormalize = useCallback(() => {
    if (!api) {
      return;
    }

    const elements = api.getSceneElements();

    const image = elements.find((i) => i.id === ImageID);
    if (!image) {
      return;
    }

    const newElements = elements
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

    console.log(
      newElements
        .filter((i) => i.type === "rectangle")
        .map((i) => [i.customData?.label, i.x, i.y, i.width, i.height]),
    );

    api.updateScene({
      elements: newElements,
    });
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

    const dispose = api.onChange((elements) => {
      console.log(elements);
      setBoxes(
        elements
          .filter((i) => i.type === "rectangle" && !i.isDeleted)
          .map((element) => {
            return {
              id: element.id,
              label: element.customData?.label || "",
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
            };
          }),
      );
    });

    return () => {
      dispose();
    };
  }, [api]);

  return (
    <FloatList className={styles.wrapper} position="right">
      {boxes.length === 0 ? (
        <Empty description="No box has been drawn" />
      ) : undefined}
      {boxes.map((box) => {
        return (
          <div key={box.id} className={styles.box}>
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
      {boxes.length > 0 ? (
        <div className={styles.flex}>
          <Button type="primary" onClick={handleNormalize}>
            Normalize
          </Button>
        </div>
      ) : undefined}
    </FloatList>
  );
}
