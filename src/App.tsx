import { useLoading, useProxy } from "@allape/use-loading";
import {
  convertToExcalidrawElements,
  Excalidraw,
} from "@excalidraw/excalidraw";
import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform";
import { FileId } from "@excalidraw/excalidraw/types/element/types";
import {
  BinaryFileData,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { Modal, Spin } from "antd";
import cls from "classnames";
import { nanoid } from "nanoid";
import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import BoxList from "./component/BoxList";
import ImageQueue from "./component/ImageQueue";
import { BorderID, ImageID } from "./config";
import { randomColor } from "./helper/color.ts";
import { getSize } from "./helper/image.ts";
import { sha256ToHex } from "./helper/sha256.ts";
import useColorScheme from "./hook/useColorScheme.ts";
import { ILV } from "./model/antd.ts";
import { IBox } from "./model/box.ts";
import styles from "./style.module.scss";

export type PredicatedBox = Omit<IBox, "strokeColor" | "id">;

export interface IAppProps {
  id?: string;
  floatCardClassName?: string;
  className?: string;
  style?: CSSProperties;
  urls?: string[];
  classes: ILV<string>[];
  /**
   * return false or promised false to stop annotation
   * @param url
   * @param boxes
   */
  onReport?: (
    url: string,
    boxes: IBox[],
  ) => Promise<boolean | void> | boolean | void;
  predicate?: (url: string, file: Blob) => Promise<PredicatedBox[]>;
}

export default function App({
  id,
  floatCardClassName,
  className,
  style,
  urls: urlsFromProps,
  classes,
  predicate,
  onReport,
}: IAppProps): ReactElement {
  const { loading, execute } = useLoading();
  const isDark = useColorScheme();

  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);

  const [urls, urlsRef, setUrls] = useProxy<string[]>([]);
  const [url, urlRef, setUrl] = useProxy<string | undefined>(undefined);
  const [api, apiRef, setApi] = useProxy<ExcalidrawImperativeAPI | undefined>(
    undefined,
  );

  const putImageIntoBoard = useCallback(
    async (url: string, api?: ExcalidrawImperativeAPI) => {
      if (!url) {
        return;
      }

      await execute(async () => {
        api = api || apiRef.current;
        if (!api) {
          return;
        }

        // destroy old files
        Object.entries(api.getFiles()).forEach(([, file]) => {
          if (file.dataURL.startsWith("blob:")) {
            URL.revokeObjectURL(file.dataURL);
          }
        });

        const file = await fetch(url).then((res) => res.blob());

        let boxes: PredicatedBox[] = [];
        try {
          boxes = (await predicate?.(url, file)) || [];
        } catch (e) {
          Modal.error({
            title: "Error",
            content: (e as Error).message,
          });
          console.error(e);
        }

        const dataURL = URL.createObjectURL(file);
        const [width, height] = await getSize(dataURL);

        const id = (await sha256ToHex(file)) as FileId;
        api.addFiles([
          {
            id,
            mimeType: file.type,
            dataURL,
            created: Date.now(),
          } as BinaryFileData,
        ]);

        const borderWidth = 10;

        let strokeWidth = (width > height ? height : width) * 0.01;
        strokeWidth = strokeWidth < 2 ? 2 : strokeWidth;
        strokeWidth = strokeWidth > 10 ? 10 : strokeWidth;

        const elements = convertToExcalidrawElements(
          [
            {
              id: BorderID,
              type: "line",
              locked: true,
              x: 0,
              y: 0,
              roughness: 0,
              strokeWidth: borderWidth,
              strokeColor: "#000",
              opacity: 10,
              points: [
                [-borderWidth, -borderWidth],
                [width + borderWidth, -borderWidth],
                [width + borderWidth, height + borderWidth],
                [-borderWidth, height + borderWidth],
                [-borderWidth, -borderWidth],
              ],
            },
            {
              id: ImageID,
              type: "image",
              locked: true,
              fileId: id,
              x: 0,
              y: 0,
              width,
              height,
            },
            ...boxes.map<ExcalidrawElementSkeleton>((box) => ({
              id: nanoid(),
              type: "rectangle",
              customData: {
                label: box.label,
              },
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              strokeColor: randomColor(),
              strokeWidth,
            })),
          ],
          {
            regenerateIds: false,
          },
        );

        api.updateScene({
          elements,
          appState: {
            currentItemRoughness: 0,
            currentItemStrokeWidth: strokeWidth,
            currentItemStrokeColor: randomColor(),
            currentItemRoundness: "sharp",
          },
        });

        api.setActiveTool({
          ...api.getAppState().activeTool,
          locked: true,
        });

        api.scrollToContent();
      });
    },
    [apiRef, execute, predicate],
  );

  useEffect(() => {
    const set = Array.from(new Set(urlsFromProps || []));
    setUrls(set);
    setUrl(set[0]);
  }, [setUrl, setUrls, urlsFromProps]);

  useEffect(() => {
    if (!api) return;

    if (!url) {
      api.resetScene();
      return;
    }

    putImageIntoBoard(url).then();
  }, [api, putImageIntoBoard, url]);

  useEffect(() => {
    if (!api || !wrapper) {
      return;
    }
    const handleResize = () => {
      if (wrapper.clientWidth < 800) {
        api.setToast({
          message: "The content width is too small, please set it wider.",
          closable: true,
        });
      } else {
        api.setToast(null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [api, wrapper]);

  const handleReport = useCallback(
    (boxes: IBox[]) => {
      const url = urlRef.current;
      if (!url) {
        return;
      }
      execute(async () => {
        const res = await onReport?.(url, boxes);
        if (res === false) {
          return;
        }
        let nextIndex = urlsRef.current.indexOf(url) + 1;
        if (nextIndex >= urlsRef.current.length) {
          nextIndex = 0;
        }
        setUrl(urlsRef.current[nextIndex]);
      }).then();
    },
    [execute, onReport, setUrl, urlRef, urlsRef],
  );

  return (
    <Spin spinning={loading}>
      <div
        ref={setWrapper}
        id={id}
        className={cls(styles.wrapper, className)}
        style={style}
      >
        <Excalidraw
          excalidrawAPI={setApi}
          theme={isDark ? "dark" : "light"}
          zenModeEnabled
        />
        <ImageQueue
          className={floatCardClassName}
          urls={urls}
          value={url}
          onChange={setUrl}
        />
        <BoxList
          className={floatCardClassName}
          api={api}
          options={classes}
          onReport={handleReport}
        />
      </div>
    </Spin>
  );
}
