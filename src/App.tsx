import { useLoading, useProxy } from "@allape/use-loading";
import {
  convertToExcalidrawElements,
  Excalidraw,
} from "@excalidraw/excalidraw";
import { FileId } from "@excalidraw/excalidraw/types/element/types";
import {
  BinaryFileData,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { Spin } from "antd";
import cls from "classnames";
import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { IBox } from "./component/BoxForm";
import BoxList from "./component/BoxList";
import ImageQueue from "./component/ImageQueue";
import { BorderID, ImageID } from "./config";
import { ILV } from "./config/antd.ts";
import { randomColor } from "./helper/color.ts";
import { sha256ToHex } from "./helper/sha256.ts";
import useColorScheme from "./hook/useColorScheme.ts";
import { getSize } from "./helper/image.ts";
import styles from "./style.module.scss";

const OPTIONS: ILV<string>[] = [
  {
    label: "Person",
    value: "0",
  },
];

export interface IAppProps {
  className?: string;
  style?: CSSProperties;
  urls?: string[];
  onReport?: (url: string, boxes: IBox[]) => Promise<void> | void;
}

export default function App({
  className,
  style,
  urls: urlsFromProps,
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
    async (url: string | File, api?: ExcalidrawImperativeAPI) => {
      if (!url) {
        return;
      }

      await execute(async () => {
        api = api || apiRef.current;
        if (!api) {
          return;
        }

        let file: Blob;
        if (typeof url === "string") {
          file = await fetch(url).then((res) => res.blob());
        } else {
          file = url;
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
            // {
            //   id: "RectPreset",
            //   type: "rectangle",
            //   roughness: 0,
            //   roundness: null,
            //   x: 0,
            //   y: 0,
            //   width: 1,
            //   height: 1,
            //   locked: true,
            //   opacity: 0,
            // },
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
          ],
          {
            regenerateIds: false,
          },
        );

        let strokeWidth = (width > height ? height : width) * 0.01;
        strokeWidth = strokeWidth < 2 ? 2 : strokeWidth;
        strokeWidth = strokeWidth > 10 ? 10 : strokeWidth;

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
    [apiRef, execute],
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
        await onReport?.(url, boxes);
        const urls = urlsRef.current.filter((u) => u !== url);
        setUrls(urls);
        setUrl(urls[0]);
      }).then();
    },
    [execute, onReport, setUrl, setUrls, urlRef, urlsRef],
  );

  return (
    <Spin spinning={loading}>
      <div
        ref={setWrapper}
        className={cls(styles.wrapper, className)}
        style={style}
      >
        <Excalidraw
          excalidrawAPI={setApi}
          theme={isDark ? "dark" : "light"}
          zenModeEnabled
        />
        <ImageQueue urls={urls} value={url} onChange={setUrl} />
        <BoxList api={api} options={OPTIONS} onReport={handleReport} />
      </div>
    </Spin>
  );
}
