export type Width = number;
export type Height = number;

export async function getSize(url: string): Promise<[Width, Height]> {
  const image = new Image();
  return new Promise<[Width, Height]>((resolve, reject) => {
    image.onload = () => {
      resolve([image.width, image.height]);
    };
    image.onerror = reject;
    image.src = url;
  });
}
