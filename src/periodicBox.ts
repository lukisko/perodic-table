import * as MRE from '@microsoft/mixed-reality-extension-sdk';

type periodicTableType = string[][];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const periodicTableInfo: periodicTableType = require('../public/periodicTable.json');
const buttonBoxSize = 1;
const periodBlackBoxSize = 0.1;
const periodicWhiteBoxSize = 0.15;
const periodBigBoxSize = 0.4
const margin = 0;
const zDimension = 0.03;

export default class PeriodicTable {
	private position: MRE.Vector3Like;
	private rotation: MRE.QuaternionLike;
	private currentElement: MRE.Actor;
	private centerSpace: MRE.Actor;
	private elementBoxes: Map<string, MRE.Actor>;
	private elementBoxesArr: MRE.Actor[]; //arr just to know what actors are not "taken"
	private elementBoxesIndex: number;
	private readonly groupName: string = "TEST";
	private readonly groupName2: string = "Cs";
	private groupMask: MRE.GroupMask;
	private groupMask2: MRE.GroupMask;
	private started: boolean;
	private cubesWanted: string[];
	private cubesWantedMap: Map<string, string>;

	public constructor(private assets: MRE.AssetContainer,
		position: MRE.Vector3Like, rotation: MRE.QuaternionLike = { x: 0, y: 0, z: 0, w: 1 }) {
		this.position = position;
		this.rotation = rotation;
		this.centerSpace = MRE.Actor.Create(this.assets.context, {
			actor: {
				transform: { app: { position: this.position, rotation: this.rotation } }
			}
		});
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		this.cubesWanted = require("../public/periodicTableUltimate.json");
		this.cubesWantedMap = new Map<string, string>();
		for (let i = 0; i < this.cubesWanted.length; i++) {
			const str = this.cubesWanted[i];
			this.cubesWantedMap.set(str, str);
		}
		this.elementBoxesArr = [];
		this.elementBoxes = new Map<string, MRE.Actor>();
		this.makeChangingBox({ x: 2, y: 0, z: 0 });
		this.started = false;

		//this.makePeriodicBox({x:0,y:0,z:0},this.groupName,this.groupMask);
		//this.makePeriodicBox({x:-1,y:0,z:0},this.groupName2,this.groupMask2);
		this.makeAllPeriodicBoxes();

		const arr = this.makeRandomElement();
		this.changeChangingCube(arr[0], arr[1]);
		//console.log(periodicTableInfo);
	}

	/**
	 * this function is going to create all boxes using makePeriodicBox or makeFinishedPeriodicBox
	 * it is needed that the wanted boxes are in this.cubesWantedMap
	 */

	private makeAllPeriodicBoxes() {
		const tableWidth = periodicTableInfo.length;
		let startingX = 0;

		const startingZ = 0;
		for (let i = 0; i < tableWidth; i++) {
			const tableColumn = periodicTableInfo[i];
			//console.log(tableColumn);
			let startingY = 0;
			for (let j = 0; j < tableColumn.length; j++) {
				const elementName = tableColumn[j];
				if (this.cubesWantedMap.get(elementName)) {
					this.makePeriodicBox({
						x: startingX,
						y: startingY,
						z: startingZ,
					}, elementName, i);
				} else {
					this.makeFinishedPeriodicBox({
						x: startingX,
						y: startingY,
						z: startingZ,
					}, elementName, i);
				}
				/*if (i > 1 && i < 12) {
					this.makeFinishedPeriodicBox({
						x: startingX,
						y: startingY,
						z: startingZ,
					}, elementName, i);
				} else {
					this.makePeriodicBox({
						x: startingX,
						y: startingY,
						z: startingZ,
					}, elementName, i);
				}*/

				startingY += periodBigBoxSize + margin;
			}
			startingX -= periodBigBoxSize + margin;
		}
	}

	/**
	 * funciton that create a box and put it into this.lementBoxes and this.elementBoxesArr
	 * @param position position where is the cube wanted
	 * @param element name of the element from pariodic table
	 * @param elementGroup tag that is used to know in which folder is the image
	 */

	public makePeriodicBox(position: MRE.Vector3Like, element: string, elementGroup: number) {
		const blackMaterial = this.assets.createMaterial("blackMaterial", {
			color: { r: 0, g: 0, b: 0 }
		});
		const box = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {
				shape: MRE.PrimitiveShape.Box,
				dimensions: { x: periodBlackBoxSize, y: periodBlackBoxSize, z: zDimension }
			},
			addCollider: true,
			actor: {
				name: element,
				tag: "group" + (elementGroup + 1),
				parentId: this.centerSpace.id,
				transform: { local: { position: position } },
				appearance: {
					materialId: blackMaterial.id
				}
			}
		});
		this.elementBoxes.set(element, box);
		this.elementBoxesArr.push(box);
		this.makePeriodicBoxAction(box);
	}
	
	/**
	 * funciton that create a box and put it into this.lementBoxes
	 * @param position position where should the cube be
	 * @param element string of the element name according to periodic table
	 * @param elementGroup name that will be tag to know in which folder ti find the texture
	 */

	public makeFinishedPeriodicBox(position: MRE.Vector3Like, element: string, elementGroup: number) {
		const texture = this.assets.createTexture("elementT-Cs", {
			uri: "/group" + (elementGroup + 1) + "/" + element + ".png"
		});
		const material = this.assets.createMaterial("elementM-Cs", {
			mainTextureId: texture.id,
		});
		const box = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {
				shape: MRE.PrimitiveShape.Box,
				dimensions: { x: periodBigBoxSize, y: periodBigBoxSize, z: zDimension }
			},
			addCollider: true,
			actor: {
				name: element,
				tag: "group" + (elementGroup + 1),
				parentId: this.centerSpace.id,
				transform: { local: { position: position } },
				appearance: {
					materialId: material.id
				}
			}
		});
		this.elementBoxes.set(element, box);
	}

	/**
	 * function that will make cube appear to be selected by creating bigger white box
	 * @param parent cube that show which cube user point to
	 * @param user to which user should be cube exclusive to
	 */

	private makeBox2(parent: MRE.Actor, user: MRE.User) {
		MRE.Actor.CreatePrimitive(this.assets, {
			definition: {
				shape: MRE.PrimitiveShape.Box,
				dimensions: { x: periodicWhiteBoxSize, y: periodicWhiteBoxSize, z: zDimension + 0.01 }
			},
			addCollider: true,
			actor: {
				parentId: parent.id,
				//transform:{app:{position:{x:0,y:0,z:0}}}
				exclusiveToUser: user.id
			}
		})
	}

	/**
	 * function that create clicking action, separated because of later joiner bug
	 * @param box actor that will gain the clicking and hover ability
	 */

	public makePeriodicBoxAction(box: MRE.Actor) {
		const button = box.setBehavior(MRE.ButtonBehavior);
		button.onHover("enter", (user) => {
			if (box.tag.startsWith("group")) {
				this.makeBox2(box, user);
			}

		});
		button.onHover("exit", (user) => {
			const cube = box.children.pop()
			if (cube) {
				cube.destroy();
			}
		});
		button.onClick(() => {
			if (this.currentElement.tag === box.name) {
				//console.log(true);
				box.appearance.materialId = this.currentElement.appearance.materialId;
				const ration = periodBigBoxSize / periodBlackBoxSize;
				box.transform.local.scale = new MRE.Vector3(ration, ration, 1.1);
				//console.log(this.elementBoxesArr.length,this.elementBoxesIndex);
				this.elementBoxesArr[this.elementBoxesIndex].tag = "DONE";
				this.elementBoxesArr.splice(this.elementBoxesIndex, 1);
			}
			const arr = this.makeRandomElement();
			if (arr.length > 1) {
				this.changeChangingCube(arr[0], arr[1]);
			}
			const elemToDel = box.children.pop();
			if (elemToDel) {
				elemToDel.destroy();
			}
		})
	}

	/**
	 * function that create actor that will show element that a person want to find place for
	 * @param position vector that say position where to have the cube
	 */

	private makeChangingBox(position: MRE.Vector3Like) {
		const texture = this.assets.createTexture("elementT-Cs", {
			uri: "/group1/Cs.png"
		});
		//console.log(texture.uri);
		const material = this.assets.createMaterial("elementM-Cs", {
			mainTextureId: texture.id,
		});
		this.currentElement = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {
				shape: MRE.PrimitiveShape.Box,
				dimensions: { x: buttonBoxSize, y: buttonBoxSize, z: buttonBoxSize }
			},
			addCollider: true,
			actor: {
				tag: "Cs",
				parentId: this.centerSpace.id,
				transform: { local: { position: position } },
				appearance: {
					materialId: material.id
				}
			}
		});

		this.changingCubeClickAction();
	}

	/**
	 * action for this.currentElement that will gain click capatibilities
	 */

	private changingCubeClickAction() {
		const cubeButton = this.currentElement.setBehavior(MRE.ButtonBehavior);
		cubeButton.onClick((user) => {
			if (this.started) {
				return;
			}
			user.prompt("how hard do you want it? (0,1 or 2)", true)
				.then((value) => {
					if (value.submitted) {
						switch (value.text) {
							case "0":
								// eslint-disable-next-line @typescript-eslint/no-var-requires
								this.reloadBoxes("../public/periodicTableEasy.json");
								break;
							case "1":
								// eslint-disable-next-line @typescript-eslint/no-var-requires
								this.reloadBoxes("../public/periodicTableMedium.json");
								break;
							case "2":
								this.reloadBoxes("../public/periodicTableUltimate.json");
								// if you want it hard you will have all of them
								break;
							default:
								user.prompt("Sorry I did not get it, please try again");
						}
					}
				})
		})
	}

	/**
	 * function that change this.cubesWanted, this.elementBoxes, this.elementBoxesArr and remake this.elementCube
	 * @param url address to json where are elements that a person will need to put on place
	 */

	private reloadBoxes(url: string) {
		this.cubesWanted = require(url);
		this.elementBoxes.forEach((value) => {
			value.destroy();
		});
		console.log("boxes destroyed.");
		this.cubesWantedMap = new Map<string, string>();
		for (let i = 0; i < this.cubesWanted.length; i++) {
			const str = this.cubesWanted[i];
			this.cubesWantedMap.set(str, str);
		}
		this.elementBoxes = new Map<string, MRE.Actor>();
		this.elementBoxesArr = [];
		this.makeAllPeriodicBoxes();
		const arr = this.makeRandomElement();
		this.changeChangingCube(arr[0], arr[1]);
	}

	/**
	 * what will happen when a user will join, we need to remake everithing clickable because of leter joiner bug
	 */

	public onUserJoin() {
		this.elementBoxesArr.forEach((value) => {
			this.makePeriodicBoxAction(value);
		});
		this.changingCubeClickAction();
	}

	private makeRandomElement(): string[] { //TODO make it the way that there will be no duplicates
		if (this.elementBoxesArr.length < 1) {
			this.allElementsTaken();
			return [];
		}
		const randomCubeIndex = Math.floor(Math.random() * this.elementBoxesArr.length);
		const randomCube = this.elementBoxesArr[randomCubeIndex];
		this.elementBoxesIndex = randomCubeIndex;
		console.log(randomCube.tag);
		return [randomCube.tag, randomCube.name];
	}

	private allElementsTaken() {
		//TODO what to do if all of them are on its place
	}

	private changeChangingCube(groupNumber: string, element: string) {
		if (!this.currentElement) {
			return;
		}
		const texture = this.assets.createTexture("element-" + element, {
			uri: "./" + groupNumber + "/" + element + ".png"
		});
		//console.log(texture.uri);
		const material = this.assets.createMaterial("element-" + element, {
			mainTextureId: texture.id,
		});
		this.currentElement.tag = element;
		this.currentElement.appearance.materialId = material.id;
	}

}
