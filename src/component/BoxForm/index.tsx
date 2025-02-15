import { DeleteOutlined } from "@ant-design/icons";
import { Button, InputNumber, Select, Space } from "antd";
import { ReactElement } from "react";
import { ILV } from "../../config/antd.ts";

export interface IBox {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const Default: IBox = {
  id: "",
  label: "",
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

export interface IBoxFormProps {
  options?: ILV<IBox["label"]>[];
  value?: IBox;
  onChange?: (value: IBox) => void;
  onFocus?: () => void;
  onDelete?: () => void;
}

export default function BoxForm({
  options,
  value,
  onChange,
  onFocus,
                                  onDelete,
}: IBoxFormProps): ReactElement {
  const { id, label, x, y, width, height } = value || Default;

  const handleChange = (field: keyof IBox, value: unknown) => {
    onChange?.({
      id,
      label,
      x,
      y,
      width,
      height,
      [field]: value,
    });
  };

  return (
    <div>
      <Space.Compact data-id={id}>
        <Select
          value={label}
          style={{ width: "100px" }}
          options={options}
          onChange={(e) => handleChange("label", e)}
        />
        <InputNumber
          value={x}
          onChange={(e) => handleChange("x", e)}
          step={1}
          precision={0}
          onFocus={onFocus}
        />
        <InputNumber
          value={y}
          onChange={(e) => handleChange("y", e)}
          step={1}
          precision={0}
          onFocus={onFocus}
        />
        <InputNumber
          value={width}
          onChange={(e) => handleChange("width", e)}
          step={1}
          precision={0}
          onFocus={onFocus}
        />
        <InputNumber
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
