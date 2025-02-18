import { SelectProps } from "antd";

export type LVs = Exclude<SelectProps["options"], undefined>;

export type LV = LVs[number];

export interface ILV<VALUE extends LV["value"]> extends LV {
  value: VALUE;
  keywords?: string;
}
