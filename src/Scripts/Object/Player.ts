import * as Phaser from "phaser";
import BubbleManager from "../Manager/BubbleManager";
import Bubble from "../Object/Bubble";
import { Vector } from "matter";

const Y_LIMIT: number = 75;
const FIRE_RATE: number = 400;

export default class Player extends Phaser.GameObjects.Rectangle {
  public colorCode: number;
  private heldBubbles: Bubble[];
  private launchPos: Phaser.Math.Vector2;
  private offset: number;
  private bubblespeed: number;
  private line: Phaser.Geom.Line;
  private guidanceHead: Phaser.Geom.Line;
  private graphics: Phaser.GameObjects.Graphics;

  private barLine: Phaser.Geom.Line;

  private leftBorder: Phaser.Geom.Line;
  private rightBorder: Phaser.Geom.Line;

  private reflectionLine: Phaser.Geom.Line;

  private lastFired: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y * 3.5, x * 2, y, 0xff0040, 0.5);

    this.scene.add.existing(this);

    this.offset = 150;

    this.lastFired = 0;

    this.launchPos = new Phaser.Math.Vector2(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 1.25
    );

    this.bubblespeed = 2000;

    this.graphics = scene.add.graphics();
    this.line = new Phaser.Geom.Line(
      this.launchPos.x,
      this.launchPos.y,
      this.launchPos.x,
      this.launchPos.y
    );

    this.guidanceHead = new Phaser.Geom.Line(
      this.launchPos.x,
      this.launchPos.y,
      this.launchPos.x,
      this.launchPos.y
    );

    this.barLine = new Phaser.Geom.Line(
      0,
      this.launchPos.y,
      this.scene.cameras.main.width,
      this.launchPos.y
    );

    this.leftBorder = new Phaser.Geom.Line(0, 0, 0, scene.cameras.main.height);

    this.rightBorder = new Phaser.Geom.Line(
      scene.cameras.main.width,
      0,
      scene.cameras.main.width,
      scene.cameras.main.height
    );

    this.reflectionLine = new Phaser.Geom.Line(0, 0, 0, 0);

    this.graphics.lineStyle(10, 0x00fff0);
    this.graphics.strokeLineShape(this.line);
    this.graphics.strokeLineShape(this.guidanceHead);

    this.setInteractive({ draggable: true });
    this.heldBubbles = new Array<Bubble>();
    this.heldBubbles.push(BubbleManager.Instance.getBubble());
    this.heldBubbles.push(BubbleManager.Instance.getBubble());
    BubbleManager.Instance.shootGroup.add(this.heldBubbles[0]);
    BubbleManager.Instance.shootGroup.add(this.heldBubbles[1]);
    BubbleManager.Instance.bubblePool.remove(this.heldBubbles[0]);
    BubbleManager.Instance.bubblePool.remove(this.heldBubbles[1]);

    this.setBubbleForLaunch();

    this.on("dragstart", function (pointer: Phaser.Input.Pointer) {
      console.log("dragstart");
    });

    this.on("drag", function (pointer: Phaser.Input.Pointer) {
      //console.log(pointer.x);
      //console.log(pointer.y);
      //let length = Phaser.Geom.Line.Length(this.line) * 5;
      let length = 2000;
      let reflectAngle = Phaser.Geom.Line.ReflectAngle(this.line, this.barLine);
      let refAngleInDeg = Phaser.Math.RadToDeg(reflectAngle);
      reflectAngle = Phaser.Math.DegToRad(-(refAngleInDeg - 180));
      this.line.x2 = pointer.x;
      if (pointer.y < this.launchPos.y + Y_LIMIT) {
        this.line.y2 = this.launchPos.y + Y_LIMIT;
      } else {
        this.line.y2 = pointer.y;
      }

      //this.guidanceHead.x1 = -pointer.x;
      //this.guidanceHead.y1 = -pointer.y;

      Phaser.Geom.Line.SetToAngle(
        this.guidanceHead,
        this.launchPos.x,
        this.launchPos.y,
        reflectAngle,
        length
      );

      this.graphics.clear();
      this.graphics.lineStyle(10, 0x00fff0);

      let points = this.guidanceHead.getPoints(32);

      this.drawGuideline(points);

      //graphics.strokeLineShape(this.guidanceHead);
      this.graphics.strokeLineShape(this.line);

      let p = new Phaser.Geom.Point();
      //console.log(this.rightBorder);
      //console.log(this.leftBorder);
      //check if intersects with border left
      if (
        Phaser.Geom.Intersects.LineToLine(this.guidanceHead, this.leftBorder, p)
      ) {
        let screenReflect = Phaser.Geom.Line.ReflectAngle(
          this.guidanceHead,
          this.leftBorder
        );
        Phaser.Geom.Line.SetToAngle(
          this.reflectionLine,
          p.x,
          p.y,
          screenReflect,
          length
        );
        let points = this.reflectionLine.getPoints(32);

        this.drawGuideline(points);
        //graphics.strokeLineShape(this.reflectionLine);
      }
      //check if intersects with borer right
      if (
        Phaser.Geom.Intersects.LineToLine(
          this.guidanceHead,
          this.rightBorder,
          p
        )
      ) {
        let screenReflect = Phaser.Geom.Line.ReflectAngle(
          this.guidanceHead,
          this.rightBorder
        );
        Phaser.Geom.Line.SetToAngle(
          this.reflectionLine,
          p.x,
          p.y,
          screenReflect,
          length
        );
        let points = this.reflectionLine.getPoints(32);

        this.drawGuideline(points);
        /*let points = this.reflectionLine.getPoints(32);

        for (let i = 0; i < points.length; i++) {
          let point = points[i];
          graphics.fillRect(point.x - 2, point.y - 2, 10, 10);
        }*/
        //graphics.strokeLineShape(this.reflectionLine);
      }
    });

    this.on("dragend", function (pointer: Phaser.Input.Pointer) {
      console.log("lift");
      //console.log(pointer.x);
      //console.log(pointer.y);
      let yPos: number = 0;

      if (pointer.y < this.launchPos.y + Y_LIMIT) {
        yPos = this.launchPos.y + Y_LIMIT;
      } else {
        yPos = pointer.y;
      }

      let endPoint: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
        pointer.x,
        yPos
      );

      let dir: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
        this.launchPos.x - endPoint.x,
        this.launchPos.y - endPoint.y
      );
      dir.normalize();
      this.line.setTo(
        this.launchPos.x,
        this.launchPos.y,
        this.launchPos.x,
        this.launchPos.y
      );
      this.graphics.clear();
      //graphics.lineStyle(2, 0x00ff00);
      //graphics.strokeLineShape(this.line);
      //graphics.clear;
      //console.log(this.scene.time);
      //console.log(this.lastFired);
      if (this.scene.time.now > this.lastFired) {
        this.lastFired = this.scene.time.now + FIRE_RATE;

        this.launchBubble(dir);
      }
    });
  }

  setBubbleForLaunch(): void {
    this.heldBubbles[0].setPosition(this.launchPos.x, this.launchPos.y);
    this.heldBubbles[1].setPosition(
      this.launchPos.x - this.offset,
      this.launchPos.y
    );
  }

  launchBubble(dir: Phaser.Math.Vector2): void {
    this.heldBubbles
      .shift()
      .setVelocity(dir.x * this.bubblespeed, dir.y * this.bubblespeed)
      .playShoot();

    let b: Bubble = BubbleManager.Instance.getBubble();
    this.heldBubbles.push(b);
    BubbleManager.Instance.shootGroup.add(b);
    BubbleManager.Instance.bubblePool.remove(b);

    this.setBubbleForLaunch();
  }

  drawGuideline(points: Array<any>) {
    for (let i = 0; i < points.length; i++) {
      let point = points[i];
      let gridPos = BubbleManager.Instance.getGridPosition(point.x, point.y);
      if (!BubbleManager.Instance.getBubbleFromGrid(gridPos[0], gridPos[1])) {
        this.graphics.fillRect(point.x - 2, point.y - 2, 10, 10);
      }
    }
  }

  update(time) {
    //console.log(time);
  }
}
