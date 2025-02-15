import { Avatar, Empty } from "antd";
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
    <FloatList className={styles.wrapper}>
      {urls.length > 0 ? (
        urls.map((u) => (
          <Avatar
            key={u}
            size={64}
            shape={u !== value ? "circle" : "square"}
            src={u}
            className={styles.image}
            onClick={() => onChange?.(u)}
          />
        ))
      ) : (
        <Empty description="Image Queue is empty" />
      )}
    </FloatList>
  );
}
