import cls from "classnames";
import { PropsWithChildren, ReactElement } from "react";
import styles from "./style.module.scss";

export interface IFloatListProps {
  className?: string;
  position?: "left" | "right";
}

export default function FloatList({
  children,
  className,
  position = "left",
}: PropsWithChildren<IFloatListProps>): ReactElement {
  return (
    <div className={cls(styles.wrapper, styles[position], className)}>
      {children}
    </div>
  );
}
