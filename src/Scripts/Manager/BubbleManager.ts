import * as Phaser from "phaser";
import Bubble from "../Object/Bubble";

const INIT_BUBBLE_NUMBER: number = 37; //5 rows, 7 on odds 8 on evens, 7*3 + 8*2 = 37
const BUBBLE_WIDTH: number = 90; //from ball radius *2. Will need to find out how to make this a global variable
export default class BubbleManager {
  private static instance: BubbleManager;
  private bubbleArray: Bubble[][];
  public bubbleGroup: Phaser.Physics.Arcade.Group;

  public static get Instance() {
    return this.instance || (this.instance = new BubbleManager());
  }

  public initBubbles(scene: Phaser.Scene): void {
    this.bubbleGroup = scene.physics.add.group();

    this.bubbleArray = new Array<Array<Bubble>>();
    let columnCounter = 7;
    for (let i = 0; i < 5; i++) {
      i % 2 === 0 ? (columnCounter = 8) : (columnCounter = 7); //check even/odd row
      //console.log("row :" + i);
      let row: Bubble[] = new Array<Bubble>();

      for (let j = 0; j < columnCounter; j++) {
        row.push(
          new Bubble(
            scene,
            scene.cameras.main.width / 2,
            scene.cameras.main.height / 2,
            "bubble"
          )
        );
        //console.log("column: " + j);
      }
      this.bubbleArray.push(row);
      //console.log(row.length);
    }

    this.sortBubbles(scene);
  }

  public sortBubbles(scene: Phaser.Scene): void {
    let offset = 45;
    let screenWidth = scene.cameras.main.width;

    //console.log(this.bubbleArray.length);

    for (let y = 0; y < this.bubbleArray.length; y++) {
      for (let x = 0; x < this.bubbleArray[y].length; x++) {
        //console.log("" + j + " " + i);
        let b: Bubble = this.bubbleArray[y][x];

        let pos = this.getBubbleCoordinate(x, y);
        b.setX(pos[0] + offset);
        b.setY(pos[1] + offset);
      }
    }

    /*let xPosRender = 0;
    let yPosRender = 0;
    let c = 0;
    this.bubbleArray.forEach((row: Array<Bubble>) => {
      row.forEach((bubble: Bubble) => {
        bubble.setX(xPosRender + offset);
        bubble.setY(yPosRender + offset);

        xPosRender += offset * 2;
      });
      xPosRender = 0;
      yPosRender += offset * 2;
    });*/
  }

  public getBubbleCoordinate(column: number, row: number): number[] {
    let xcor = column * BUBBLE_WIDTH;

    if (row % 2) {
      xcor += BUBBLE_WIDTH / 2;
    }

    let ycor = row * BUBBLE_WIDTH;
    return new Array(xcor, ycor);
  }
}
