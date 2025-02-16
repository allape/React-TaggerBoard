# docker run --rm -it -v "$(pwd)/predictor.py:/ultralytics/predictor.py" ultralytics/ultralytics:8.3.75-arm64 bash
# python predictor.py

import http.server
import io
import json
import numpy as np
import socketserver
import torch
from PIL import Image
from ultralytics import YOLO

model = YOLO("yolo11n.pt")


# model("./bus.jpg") # hot start

def image_binary_to_bchw_tensor(image_binary):
    # Convert binary data to a PIL Image
    image = Image.open(io.BytesIO(image_binary))

    # Convert the PIL Image to a NumPy array
    np_array = np.array(image)

    # Convert the NumPy array to a PyTorch tensor
    tensor = torch.from_numpy(np_array).float()

    # Add batch dimension (B) and channel dimension (C)
    if len(tensor.shape) == 2:  # Grayscale image
        tensor = tensor.unsqueeze(0).unsqueeze(0)
    else:  # RGB image
        tensor = tensor.permute(2, 0, 1).unsqueeze(0)

    return tensor


class CustomHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_body = self.rfile.read(content_length)

        tensor = image_binary_to_bchw_tensor(post_body)
        res = model(tensor)[0]

        boxes = []
        prediction = res.boxes
        for index in range(len(prediction.cls)):
            cls = prediction.cls[index]
            confidence = prediction.conf[index]
            xywh = prediction.xywh[index]
            boxes.append({
                "label": str(int(cls.item())),
                "confidence": confidence.item(),
                "x": xywh[0].item(),
                "y": xywh[1].item(),
                "width": xywh[2].item(),
                "height": xywh[3].item()
            })

        self.send_response(200)
        self.send_header("Content-type", "application/json; charset=utf-8")
        self.end_headers()

        self.wfile.write(json.dumps({
            "classes": res.names,
            "boxes": boxes
        }).encode("utf-8"))


PORT = 8080

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
