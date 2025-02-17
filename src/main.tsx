import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App, { PredicatedBox } from "./App.tsx";
import Image1 from "./asset/girl-5014099_1920.jpg";
import Image2 from "./asset/girl-7357492_1920.jpg";
import { ILV } from "./config/antd.ts";

const Classes: ILV<string>[] = [
  { label: "Person", value: "0" },
  {
    label: "Bicycle",
    value: "1",
  },
  { label: "Car", value: "2" },
  { label: "Motorcycle", value: "3" },
  {
    label: "Airplane",
    value: "4",
  },
  { label: "Bus", value: "5" },
  { label: "Train", value: "6" },
  {
    label: "Truck",
    value: "7",
  },
  { label: "Boat", value: "8" },
  { label: "Traffic light", value: "9" },
  {
    label: "Fire hydrant",
    value: "10",
  },
  { label: "Stop sign", value: "11" },
  { label: "Parking meter", value: "12" },
  {
    label: "Bench",
    value: "13",
  },
  { label: "Bird", value: "14" },
  { label: "Cat", value: "15" },
  {
    label: "Dog",
    value: "16",
  },
  { label: "Horse", value: "17" },
  { label: "Sheep", value: "18" },
  {
    label: "Cow",
    value: "19",
  },
  { label: "Elephant", value: "20" },
  { label: "Bear", value: "21" },
  {
    label: "Zebra",
    value: "22",
  },
  { label: "Giraffe", value: "23" },
  { label: "Backpack", value: "24" },
  {
    label: "Umbrella",
    value: "25",
  },
  { label: "Handbag", value: "26" },
  { label: "Tie", value: "27" },
  {
    label: "Suitcase",
    value: "28",
  },
  { label: "Frisbee", value: "29" },
  { label: "Skis", value: "30" },
  {
    label: "Snowboard",
    value: "31",
  },
  { label: "Sports ball", value: "32" },
  { label: "Kite", value: "33" },
  {
    label: "Baseball bat",
    value: "34",
  },
  { label: "Baseball glove", value: "35" },
  { label: "Skateboard", value: "36" },
  {
    label: "Surfboard",
    value: "37",
  },
  { label: "Tennis racket", value: "38" },
  { label: "Bottle", value: "39" },
  {
    label: "Wine glass",
    value: "40",
  },
  { label: "Cup", value: "41" },
  { label: "Fork", value: "42" },
  {
    label: "Knife",
    value: "43",
  },
  { label: "Spoon", value: "44" },
  { label: "Bowl", value: "45" },
  {
    label: "Banana",
    value: "46",
  },
  { label: "Apple", value: "47" },
  { label: "Sandwich", value: "48" },
  {
    label: "Orange",
    value: "49",
  },
  { label: "Broccoli", value: "50" },
  { label: "Carrot", value: "51" },
  {
    label: "Hot dog",
    value: "52",
  },
  { label: "Pizza", value: "53" },
  { label: "Donut", value: "54" },
  {
    label: "Cake",
    value: "55",
  },
  { label: "Chair", value: "56" },
  { label: "Couch", value: "57" },
  {
    label: "Potted plant",
    value: "58",
  },
  { label: "Bed", value: "59" },
  { label: "Dining table", value: "60" },
  {
    label: "Toilet",
    value: "61",
  },
  { label: "Tv", value: "62" },
  { label: "Laptop", value: "63" },
  {
    label: "Mouse",
    value: "64",
  },
  { label: "Remote", value: "65" },
  { label: "Keyboard", value: "66" },
  {
    label: "Cell phone",
    value: "67",
  },
  { label: "Microwave", value: "68" },
  { label: "Oven", value: "69" },
  {
    label: "Toaster",
    value: "70",
  },
  { label: "Sink", value: "71" },
  { label: "Refrigerator", value: "72" },
  {
    label: "Book",
    value: "73",
  },
  { label: "Clock", value: "74" },
  { label: "Vase", value: "75" },
  {
    label: "Scissors",
    value: "76",
  },
  { label: "Teddy bear", value: "77" },
  { label: "Hair drier", value: "78" },
  {
    label: "Toothbrush",
    value: "79",
  },
];

export interface IYOLORes {
  classes: Record<string, string>;
  boxes: {
    label: string;
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App
      style={{ width: "100vw", height: "100vh" }}
      classes={Classes.map((i) => ({
        ...i,
        keywords: (i.label || "").toString().toLowerCase(),
      }))}
      urls={[Image1, Image2]}
      onReport={(url, boxes) => console.log(url, boxes)}
      predicate={async (file): Promise<PredicatedBox[]> => {
        if (
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1"
        ) {
          return [];
        }

        const IYOLORes: IYOLORes = await fetch(
          import.meta.env.VITE_YOLO_SERVER_URL || "http://localhost:8080",
          {
            method: "POST",
            body: file,
          },
        ).then((res) => res.json());

        return IYOLORes.boxes
          .filter((i) => i.confidence > 0.5)
          .map((box) => ({
            label: box.label,
            x: box.x - box.width / 2,
            y: box.y - box.height / 2,
            width: box.width,
            height: box.height,
          }));
      }}
    />
  </StrictMode>,
);
