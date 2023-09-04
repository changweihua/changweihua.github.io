export default class LabelUtils {
  static createLabel(
    text: string,
    fontf = "Arial",
    color = "#00C957",
    fontSize = 60
  ): ILabel {
    const canvas = document.createElement("canvas");

    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1;

    const height = fontSize * 2.5;
    const width = text.length * fontSize * 2;
    canvas.height = Math.round(height * dpr);
    canvas.width = Math.round(width * dpr);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.font = `${fontSize}px ${fontf}`;
      ctx.fillStyle = color;
      ctx.textAlign = "start";
      ctx.textBaseline = "bottom";
      ctx.fillText(text, width / 2, height / 2);
    }

    return {
      height,
      width,
      canvas,
    };
  }

  static makeLabel = (label: string) => {
    const name = label;
    const canvas = document.createElement("canvas");
    const color = "#dddddd";
    const fontSize = 50;
    const r = fontSize / 2;
    const margin = fontSize / 2;
    const textMarginleft = 10;
    const height = fontSize * 2;
    const width =
      name.length * fontSize + 2 * margin + r * 2 + textMarginleft;
    canvas.height = height;
    canvas.width = width;
    const ctx = canvas.getContext("2d");
    if(!ctx){
      return
    }
    // out
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(margin + r, height / 2, r, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
    // inner
    ctx.beginPath();
    ctx.arc(margin + r, height / 2, 6, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.stroke();
    // font
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "start";
    ctx.textBaseline = "middle";
    ctx.fillText(name, margin + r * 2 + textMarginleft, height / 2);
    return {
      height,
      width,
      canvas,
    };
  };
}

interface ILabel {
  height: number;
  width: number;
  canvas: any;
}
