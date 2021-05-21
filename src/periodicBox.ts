import * as MRE from '@microsoft/mixed-reality-extension-sdk';

type periodicTableType = string[][];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const periodicTableInfo: periodicTableType = require('../public/periodicTable.json');
const buttonBoxSize = 1;
const periodBlackBoxSize = 0.1;
const periodicWhiteBoxSize = 0.15;
const periodBigBoxSize = 0.4
const margin = 0;

export default class PeriodicTable {
	private position: MRE.Vector3Like;
	private rotation: MRE.QuaternionLike;
	private currentElement: MRE.Actor;
	private centerSpace: MRE.Actor;
	private elementBoxes: Map<string, MRE.Actor>;
	private elementBoxesArr: MRE.Actor[]; //arr just to know what actors are "taken"
	private elementBoxesIndex: number;
	private readonly groupName: string = "TEST";
	private readonly groupName2: string = "Cs";
	private groupMask: MRE.GroupMask;
	private groupMask2: MRE.GroupMask;

	public constructor(private assets: MRE.AssetContainer,
		position: MRE.Vector3Like, rotation: MRE.QuaternionLike = { x: 0, y: 0, z: 0, w: 1 }) {
		this.position = position;
		this.rotation = rotation;
		this.centerSpace = MRE.Actor.Create(this.assets.context, {
			actor: {
				transform: { app: { position: this.position, rotation: this.rotation } }
			}
		});
		this.elementBoxesArr = [];
		this.elementBoxes = new Map<string, MRE.Actor>();
		this.makeChangingBox({ x: 2, y: 0, z: 0 });
		//this.makePeriodicBox({x:0,y:0,z:0},this.groupName,this.groupMask);
		//this.makePeriodicBox({x:-1,y:0,z:0},this.groupName2,this.groupMask2);
		this.makeAllPeriodicBoxes();
		//console.log(periodicTableInfo);
	}

	/**
	 * this function is going to create all boxes using makePeriodicBox function
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
				//if (i === 6) { console.log(elementName); }
				const groupMask = new MRE.GroupMask(this.assets.context, [elementName]);
				//if (i === 6) { console.log(elementName); }
				this.makePeriodicBox({
					x: startingX,
					y: startingY,
					z: startingZ,
				}, elementName, i, groupMask);
				startingY += periodBigBoxSize + margin;
			}
			startingX -= periodBigBoxSize + margin;
		}
	}

	public makePeriodicBox(position: MRE.Vector3Like, element: string, elementGroup: number, groupMask: MRE.GroupMask) {
		const blackMaterial = this.assets.createMaterial("blackMaterial", {
			color: { r: 0, g: 0, b: 0 }
		});
		const box = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {
				shape: MRE.PrimitiveShape.Box,
				dimensions: { x: periodBlackBoxSize, y: periodBlackBoxSize, z: periodBlackBoxSize }
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
		const box2 = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {
				shape: MRE.PrimitiveShape.Box,
				dimensions: { x: periodicWhiteBoxSize, y: periodicWhiteBoxSize, z: periodicWhiteBoxSize }
			},
			addCollider: true,
			actor: {
				parentId: this.centerSpace.id,
				transform: { local: { position: position } },
				appearance: {
					enabled: groupMask
				}
			}
		});
		box2.appearance.enabled = groupMask;
		this.elementBoxes.set(element, box);
		this.elementBoxesArr.push(box);
		this.makePeriodicBoxAction(box);
	}

	public makePeriodicBoxAction(box: MRE.Actor) {
		const button = box.setBehavior(MRE.ButtonBehavior);
		button.onHover("enter", (user) => {
			user.groups.add(box.name);
		});
		button.onHover("exit", (user) => {
			user.groups.delete(box.name);
		});
		button.onClick((user) => {
			if (this.currentElement.tag === box.name) {
				//console.log(true);
				box.appearance.materialId = this.currentElement.appearance.materialId;
				const ration = periodBigBoxSize / periodBlackBoxSize;
				box.transform.local.scale = new MRE.Vector3(ration, ration, ration);
				this.elementBoxesArr.splice(this.elementBoxesIndex, 1);
			}
			const arr = this.makeRandomElement();
			if (arr.length > 1) {
				this.changeChangingCube(arr[0], arr[1])//TODO
			}
		})
	}

	public makeChangingBox(position: MRE.Vector3Like) {
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
		MRE.Actor.Create(this.assets.context, {
			actor: {
				parentId: this.currentElement.id,
				text: {
					contents: "START",
					height: 0.2,
					color: { r: 0, g: 0, b: 0 },
					anchor: MRE.TextAnchorLocation.MiddleCenter,
				},
				transform: {
					local: { position: { x: 0, y: 0, z: - buttonBoxSize / 2 + 0.05 } }
				}
			}
		});
	}

	public onUserJoin() {
		this.elementBoxes.forEach((value) => {
			this.makePeriodicBoxAction(value);
		});
	}

	private makeRandomElement(): string[] { //TODO make it the way that there will be no duplicates
		if (this.elementBoxesArr.length < 1) {
			return [];
		}

		const randomCubeIndex = Math.floor(Math.random() * this.elementBoxesArr.length);
		const randomCube = this.elementBoxesArr[randomCubeIndex];
		this.elementBoxesIndex = randomCubeIndex;
		return [randomCube.tag, randomCube.name];
	}

	private allElementsTaken() {
		//TODO
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
