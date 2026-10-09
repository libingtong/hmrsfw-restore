// Restored from the `jspdf.es.min.*.js` chunk of the user center build.
// That chunk bundled two things: the npm package jsPDF 2.5.1 (export `E`) and the app's own
// canvas watermark class (export `H`). jsPDF now comes from npm; the watermark class is restored here.
import { jsPDF } from "jspdf";

export interface WatermarkFont {
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
  color?: string;
}

export interface WatermarkOptions {
  container?: HTMLElement;
  zIndex?: number;
  rotate?: number;
  gap?: [number, number];
  offset?: [number, number];
  font?: WatermarkFont;
  content?: string | string[];
  image?: string;
  width?: number;
  height?: number;
}

const CANVAS_SCALE = 2;
const LINE_GAP = 3;

const toKebab = (name: string) => name.replace(/([A-Z])/g, "-$1").toLowerCase();
const styleText = (style: Record<string, string | number>) =>
  Object.keys(style)
    .map((key) => `${toKebab(key)}: ${style[key]};`)
    .join(" ");
const pixelRatio = () => window.devicePixelRatio || 1;
function rotateAround(ctx: CanvasRenderingContext2D, x: number, y: number, degrees: number) {
  ctx.translate(x, y);
  ctx.rotate((Math.PI / 180) * Number(degrees));
  ctx.translate(-x, -y);
}

export class Watermark {
  defaultOptions: WatermarkOptions = { container: document.body, zIndex: 9, rotate: -22, gap: [100, 100], font: {} };
  options: WatermarkOptions;
  container: HTMLElement | undefined;
  watermarkEl: HTMLDivElement | null = null;
  gapX: number;
  gapY: number;
  gapXCenter: number;
  gapYCenter: number;
  offsetLeft: number;
  offsetTop: number;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  fontFamily: string;
  color: string;

  constructor(options: WatermarkOptions) {
    this.options = Object.assign({}, this.defaultOptions, options);
    this.container = this.options.container;
    const gap = this.options.gap ?? [100, 100];
    this.gapX = gap[0];
    this.gapY = gap[1];
    this.gapXCenter = this.gapX / 2;
    this.gapYCenter = this.gapY / 2;
    this.offsetLeft = this.options.offset?.[0] ?? this.gapXCenter;
    this.offsetTop = this.options.offset?.[1] ?? this.gapYCenter;
    const font = this.options.font ?? {};
    this.fontSize = font.fontSize ?? 16;
    this.fontWeight = font.fontWeight ?? "normal";
    this.fontStyle = font.fontStyle ?? "normal";
    this.fontFamily = font.fontFamily ?? "sans-serif";
    this.color = font.color ?? "rgba(0, 0, 0, 0.15)";
    this.init();
  }

  get markStyle(): Record<string, string | number> {
    const style: Record<string, string | number> = {
      zIndex: this.options.zIndex ?? 9,
      position: this.container === document.body ? "fixed" : "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      backgroundRepeat: "repeat",
    };
    let x = this.offsetLeft - this.gapXCenter;
    let y = this.offsetTop - this.gapYCenter;
    if (x > 0) {
      style.left = `${x}px`;
      style.width = `calc(100% - ${x}px)`;
      x = 0;
    }
    if (y > 0) {
      style.top = `${y}px`;
      style.height = `calc(100% - ${y}px)`;
      y = 0;
    }
    style.backgroundPosition = `${x}px ${y}px`;
    return style;
  }

  destroyWatermark() {
    if (this.watermarkEl) {
      this.watermarkEl.remove();
      this.watermarkEl = null;
    }
  }

  appendWatermark(dataUrl: string, markWidth: number) {
    if (!this.container || !this.watermarkEl) return;
    if (this.container !== document.body) this.container.setAttribute("style", styleText({ position: "relative" }));
    this.watermarkEl.setAttribute(
      "style",
      styleText({ ...this.markStyle, backgroundImage: `url('${dataUrl}')`, backgroundSize: `${(this.gapX + markWidth) * CANVAS_SCALE}px` }),
    );
    this.container?.append(this.watermarkEl);
    setTimeout(() => {});
  }

  getMarkSize(ctx: CanvasRenderingContext2D): [number, number] {
    const { content, image, width, height } = this.options;
    if (!image && ctx.measureText) {
      ctx.font = `${Number(this.fontSize)}px ${this.fontFamily}`;
      const lines = Array.isArray(content) ? content : [content];
      const textWidth = Math.ceil(Math.max(...lines.map((line) => ctx.measureText(line as string).width)));
      const textHeight = Number(this.fontSize) * lines.length + (lines.length - 1) * LINE_GAP;
      return [width ?? textWidth, height ?? textHeight];
    }
    return [width ?? 120, height ?? 64];
  }

  fillTexts(ctx: CanvasRenderingContext2D, x: number, y: number, markWidth: number, markHeight: number) {
    const ratio = pixelRatio();
    const content = this.options.content;
    const size = Number(this.fontSize) * ratio;
    ctx.font = `${this.fontStyle} normal ${this.fontWeight} ${size}px/${markHeight}px ${this.fontFamily}`;
    ctx.fillStyle = this.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.translate(markWidth / 2, 0);
    const lines = Array.isArray(content) ? content : [content];
    lines?.forEach((line, i) => {
      ctx.fillText(line ?? "", x, y + i * (size + LINE_GAP * ratio));
    });
  }

  renderWatermark() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = this.options.image;
    const rotate = this.options.rotate ?? -22;
    if (!ctx) return;
    if (!this.watermarkEl) this.watermarkEl = document.createElement("div");
    const ratio = pixelRatio();
    const [markWidth, markHeight] = this.getMarkSize(ctx);
    const cellWidth = (this.gapX + markWidth) * ratio;
    const cellHeight = (this.gapY + markHeight) * ratio;
    canvas.setAttribute("width", `${cellWidth * CANVAS_SCALE}px`);
    canvas.setAttribute("height", `${cellHeight * CANVAS_SCALE}px`);
    const startX = (this.gapX * ratio) / 2;
    const startY = (this.gapY * ratio) / 2;
    const drawWidth = markWidth * ratio;
    const drawHeight = markHeight * ratio;
    const centerX = (drawWidth + this.gapX * ratio) / 2;
    const centerY = (drawHeight + this.gapY * ratio) / 2;
    const secondX = startX + cellWidth;
    const secondY = startY + cellHeight;
    const secondCenterX = centerX + cellWidth;
    const secondCenterY = centerY + cellHeight;
    ctx.save();
    rotateAround(ctx, centerX, centerY, rotate);
    if (image) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, startX, startY, drawWidth, drawHeight);
        ctx.restore();
        rotateAround(ctx, secondCenterX, secondCenterY, rotate);
        ctx.drawImage(img, secondX, secondY, drawWidth, drawHeight);
        this.appendWatermark(canvas.toDataURL(), markWidth);
      };
      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";
      img.src = image;
    } else {
      this.fillTexts(ctx, startX, startY, drawWidth, drawHeight);
      ctx.restore();
      rotateAround(ctx, secondCenterX, secondCenterY, rotate);
      this.fillTexts(ctx, secondX, secondY, drawWidth, drawHeight);
      this.appendWatermark(canvas.toDataURL(), markWidth);
    }
  }

  init() {
    this.destroyWatermark();
    this.renderWatermark();
  }
}

// Original export names of the chunk (`H` = watermark class, `E` = jsPDF), so restored pages can keep them.
export { jsPDF };
export { Watermark as H, jsPDF as E };
