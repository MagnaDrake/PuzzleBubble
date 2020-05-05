import * as Phaser from "phaser";
import Bubble from "../Object/Bubble";

const INIT_BUBBLE_NUMBER: number = 37; //5 rows, 7 on odds 8 on evens, 7*3 + 8*2 = 37
const BUBBLE_WIDTH: number = 90; //from ball radius *2. Will need to find out how to make this a global variable
const ROW_HEIGHT: number = 80;
const OFFSET: number = 45;
export default class BubbleManager {
  private static instance: BubbleManager;
  private bubbleGridArray: Bubble[][];
  public bubblePool: Phaser.GameObjects.Group;
  public gridGroup: Phaser.GameObjects.Group;
  public shootGroup: Phaser.GameObjects.Group;

  public static get Instance() {
    return this.instance || (this.instance = new BubbleManager());
  }

  public initBubbles(scene: Phaser.Scene): void {
    this.bubblePool = scene.add.group({
      classType: Bubble,
      maxSize: 200,
      createCallback: function (bubble: Bubble) {
        bubble.setName("pool " + this.getLength());
        //console.log(bubble.name);
      },
      //runChildUpdate: true,
    });

    this.gridGroup = scene.add.group({
      classType: Bubble,
      createCallback: function (bubble: Bubble) {
        bubble.setName("grid " + this.getLength());
        //console.log(bubble.name);
      },
      //runChildUpdate: true,
    });

    this.shootGroup = scene.add.group({
      classType: Bubble,
      maxSize: 5,
      createCallback: function (bubble: Bubble) {
        bubble.setName("shoot " + this.getLength());
        //console.log(bubble.name);
      },
      //runChildUpdate: true,
    });

    scene.physics.add.overlap(
      this.shootGroup,
      this.gridGroup,
      this.snapBubble,
      null,
      this
    );

    this.bubbleGridArray = new Array<Array<Bubble>>();
    let columnCounter = 7;
    for (let i = 0; i < 5; i++) {
      i % 2 === 0 ? (columnCounter = 8) : (columnCounter = 7); //check even/odd row
      //console.log("row :" + i);
      let row: Bubble[] = new Array<Bubble>();

      for (let j = 0; j < columnCounter; j++) {
        let b: Bubble = new Bubble(
          scene,
          scene.cameras.main.width / 2,
          scene.cameras.main.height / 2,
          "bubble"
        );
        row.push(b);
        this.gridGroup.add(b);
      }
      this.bubbleGridArray.push(row);
    }

    this.sortBubbles();
  }
  public hah() {
    console.log("update 500ms");
  }

  public sortBubbles(): void {
    //let screenWidth = scene.cameras.main.width;
    console.log("sort!");
    for (let y = 0; y < this.bubbleGridArray.length; y++) {
      for (let x = 0; x < this.bubbleGridArray[y].length; x++) {
        let b: Bubble = this.bubbleGridArray[y][x];
        if (b) this.setBubblePosOnGrid(b, x, y);
      }
    }
  }

  public getBubbleCoordinate(column: number, row: number): number[] {
    let xcor = column * BUBBLE_WIDTH;

    if (row % 2) {
      xcor += BUBBLE_WIDTH / 2;
    }

    let ycor = row * ROW_HEIGHT;
    return new Array(xcor, ycor);
  }

  public getBubble(): Bubble {
    let bubble: Bubble = this.bubblePool.get(); //get bubble from pool, create new if no free bubble while under max
    bubble.randomizeColor();

    if (!bubble) return null; //max size, none free

    return bubble;
  }

  getNewGridPosition(x: number, y: number): number[] {
    //console.log(Math.floor(x) + " " + Math.floor(y));
    //this.sortBubbles();
    let gridY = Math.floor(y / ROW_HEIGHT);

    let xoffset = 0;
    if (gridY % 2) {
      xoffset = BUBBLE_WIDTH / 2;
    }

    let gridX = Math.floor((x - xoffset) / BUBBLE_WIDTH);

    if (gridX < 0) gridX = 0;

    return new Array(gridX, gridY);
  }

  public snapBubble(shootBubble: Bubble, gridBubble: Bubble): void {
    shootBubble.setVelocity(0, 0);

    this.shootGroup.remove(shootBubble);
    this.gridGroup.add(shootBubble);

    let gridPos = this.getNewGridPosition(shootBubble.x, shootBubble.y);
    if (this.bubbleGridArray.length - 1 < gridPos[1]) {
      let n = 0;
      gridPos[1] % 2 === 0 ? (n = 8) : (n = 7); //check even/odd row
      let row = new Array<Bubble>(n);
      this.bubbleGridArray.push(row);
      console.log(row);
    }
    //console.log("wut");
    let xLimit = Math.min(
      gridPos[0],
      this.bubbleGridArray[gridPos[1]].length - 1
    );
    console.log(this.bubbleGridArray[gridPos[1]][xLimit]);
    this.bubbleGridArray[gridPos[1]][xLimit] = shootBubble;
    console.log(gridPos);
    this.setBubblePosOnGrid(shootBubble, gridPos[0], gridPos[1]);
    //this.sortBubbles();
    console.log(shootBubble.x + " " + shootBubble.y);
    //console.log(shootBubble.y);
  }

  setBubblePosOnGrid(bubble: Bubble, x: number, y: number) {
    let pos = this.getBubbleCoordinate(x, y);
    //let n = 0;

    //fromSort ? (n = OFFSET) : (n = OFFSET);
    bubble.setPosition(pos[0] + OFFSET, pos[1] + OFFSET);
    //console.log(bubble.x, +" " + bubble.y);
  }

  //cluster finding methods
  public findCluster(bubble: Bubble, reset, skipremoved) {
    if (reset) {
      resetProcessed();
    }
  }

  resetProcessed() {}
  public update() {
    this.sortBubbles(); //not entirely sure why this function doesnt run when put inside snapBubbles
    //for not it runs on update to make sure the sprites align properly
  }
}
