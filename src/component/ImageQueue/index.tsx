import { Empty } from "antd";
import cls from "classnames";
import { ReactElement, useEffect, useRef } from "react";
import FloatList from "../FloatList";
import styles from "./style.module.scss";

export interface IImageQueueProps {
  className?: string;
  urls: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function ImageQueue({
  className,
  urls,
  value,
  onChange,
}: IImageQueueProps): ReactElement {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (urls.length === 0 || !value || !wrapperRef.current) {
      return;
    }

    const index = urls.indexOf(value);
    if (index === -1) {
      return;
    }

    wrapperRef.current
      .querySelector(`[data-rtb-image-queue-item-id="${index}"]`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }, [urls, value]);

  return (
    <FloatList className={className}>
      <div className={styles.wrapper} ref={wrapperRef}>
        {urls.length > 0 ? (
          urls.map((u, index) => (
            <div
              key={u}
              data-rtb-image-queue-item-id={index}
              className={cls(
                styles.image,
                u === value ? styles.selected : undefined,
              )}
              onClick={() => onChange?.(u)}
            >
              <img src={u} alt={u} />
            </div>
          ))
        ) : (
          <Empty description="Image Queue is empty" />
        )}
      </div>
    </FloatList>
  );
}
