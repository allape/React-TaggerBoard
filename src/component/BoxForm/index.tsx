import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input, InputNumber, Select, Space } from "antd";
import cls from "classnames";
import { ReactElement } from "react";
import { ILV } from "../../model/antd.ts";
import { Default, IBox } from "../../model/box.ts";
import styles from "./style.module.scss";

export interface IBoxFormProps {
  className?: string;
  options?: ILV<IBox["label"]>[];
  value?: IBox;
  onChange?: (value: IBox) => void;
  onFocus?: () => void;
  onDelete?: () => void;
}

export default function BoxForm({
  className,
  options,
  value,
  onChange,
  onFocus,
  onDelete,
}: IBoxFormProps): ReactElement {
  const { id, label, strokeColor, x, y, width, height } = value || Default;

  const handleChange = (field: keyof IBox, value: unknown) => {
    onChange?.({
      id,
      label,
      strokeColor,
      x,
      y,
      width,
      height,
      [field]: value,
    });
  };

  return (
    <div className={cls(styles.wrapper, className)}>
      <Space.Compact data-id={id}>
        <Select
          className={styles.input}
          value={label}
          options={options}
          showSearch
          optionFilterProp="keywords"
          onChange={(e) => handleChange("label", e)}
          onFocus={onFocus}
        />
        <Input
          type="color"
          className={styles.color}
          value={strokeColor}
          onChange={(e) => handleChange("strokeColor", e.target.value)}
          onFocus={onFocus}
        />
        <InputNumber
          className={styles.number}
          value={x}
          onChange={(e) => handleChange("x", e)}
          step={1}
          precision={0}
          onFocus={onFocus}
        />
        <InputNumber
          className={styles.number}
          value={y}
          onChange={(e) => handleChange("y", e)}
          step={1}
          precision={0}
          onFocus={onFocus}
        />
        <InputNumber
          className={styles.number}
          value={width}
          onChange={(e) => handleChange("width", e)}
          step={1}
          precision={0}
          onFocus={onFocus}
        />
        <InputNumber
          className={styles.number}
          value={height}
          onChange={(e) => handleChange("height", e)}
          step={1}
          precision={0}
          onFocus={onFocus}
        />
        <Button danger onClick={onDelete}>
          <DeleteOutlined />
        </Button>
      </Space.Compact>
    </div>
  );
}
