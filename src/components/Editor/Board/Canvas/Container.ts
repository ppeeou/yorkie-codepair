import { Tool } from 'features/boardSlices';
import Canvas from './Canvas';

import { Root, Line, Shapes, Shape, TimeTicket } from './Shape';
import { drawLine, createLine } from './utils';

enum DragStatus {
  Drag,
  Stop,
}

let dragStatus = DragStatus.Stop;

export default class Container {
  pointY: number;

  pointX: number;

  offsetY: number;

  offsetX: number;

  scene: Canvas;

  tool: Tool;

  createId?: TimeTicket;

  update: Function;

  constructor(el: HTMLCanvasElement, update: Function) {
    this.pointY = 0;
    this.pointX = 0;
    this.tool = Tool.Line;
    this.update = update;
    this.scene = new Canvas(el);

    const { y, x } = this.scene.getCanvas().getBoundingClientRect();
    this.offsetY = y;
    this.offsetX = x;

    this.init();
  }

  init() {
    this.scene.getCanvas().onmouseup = this.onmouseup.bind(this);
    this.scene.getCanvas().onmousedown = this.onmousedown.bind(this);
    this.scene.getCanvas().onmousemove = this.onmousemove.bind(this);
  }

  setTool(tool: Tool) {
    this.tool = tool;
  }

  getMouse(evt: MouseEvent) {
    this.pointY = evt.pageY - this.offsetY;
    this.pointX = evt.pageX - this.offsetX;
  }

  onmousedown(evt: MouseEvent) {
    this.getMouse(evt);
    if (this.isOutSide()) {
      return;
    }

    dragStatus = DragStatus.Drag;

    this.update((root: Root) => {
      if (this.tool === Tool.Line) {
        const shape = createLine(this.pointY, this.pointX);
        root.shapes.push(shape);
        const lastShape = root.shapes.getLast();
        this.createId = lastShape.getID();
      }
    });
  }

  onmousemove(evt: MouseEvent) {
    this.getMouse(evt);
    if (this.isOutSide()) {
      return;
    }

    if (dragStatus === DragStatus.Stop) {
      return;
    }

    this.update((root: Root) => {
      if (this.tool === Tool.Line) {
        const lastShape = root.shapes.getElementByID(this.createId) as Line;
        lastShape.points.push({
          x: this.pointX,
          y: this.pointY,
        });
        this.drawAll(root.shapes);
      }
    });
  }

  onmouseup() {
    dragStatus = DragStatus.Stop;
    this.createId = undefined;
  }

  isOutSide() {
    if (
      this.pointY < 0 ||
      this.pointX < 0 ||
      this.pointY > this.scene.getHeight() ||
      this.pointX > this.scene.getWidth()
    ) {
      this.onmouseup();
      return true;
    }
    return false;
  }

  drawAll(shapes: Shapes, canvas: Canvas = this.scene) {
    canvas.clear();
    for (const shape of shapes) {
      this.draw(shape, canvas);
    }
  }

  draw(shape: Shape, canvas: Canvas = this.scene) {
    if (shape.type === 'line') {
      drawLine(canvas.getContext(), shape as Line);
    }
  }

  clear() {
    this.scene.clear();
  }
}
