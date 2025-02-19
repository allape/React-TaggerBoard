import cls from "classnames";
import {
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  ReactElement,
} from "react";
import styles from "./style.module.scss";

export interface IFloatListProps {
  className?: string;
  position?: "left" | "right";
}

export function FloatList(
  {
    children,
    className,
    position = "left",
  }: PropsWithChildren<IFloatListProps>,
  ref: ForwardedRef<HTMLDivElement | null>,
): ReactElement {
  return (
    <div ref={ref} className={cls(styles.wrapper, styles[position], className)}>
      {children}
    </div>
  );
}

export default forwardRef(FloatList);
