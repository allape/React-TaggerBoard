import { Empty } from "antd";
import cls from "classnames";
import { ReactElement } from "react";
import FloatList from "../FloatList";
import styles from "./style.module.scss";

export interface IImageQueueProps {
  urls: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function ImageQueue({
  urls,
  value,
  onChange,
}: IImageQueueProps): ReactElement {
  return (
    <FloatList>
      <div className={styles.wrapper}>
        {urls.length > 0 ? (
          urls.map((u) => (
            <div
              key={u}
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
