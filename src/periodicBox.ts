import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import request from 'request';
import Database from './database';

type periodicTableType = string[][];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const periodicTableInfo: periodicTableType = require('../public/periodicTable.json');
const buttonBoxSize = 1;
const buttonBoxZSize = 0.03;
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
	private groupMaskParticipants: MRE.GroupMask;
	private groupMaskNoParticipants: MRE.GroupMask;
	private readonly participantGroup = "PARTICIPANTS";
	private started: boolean;
	private cubesWanted: string[];
	private cubesWantedMap: Map<string, string>;
	private participants: MRE.Guid[];
	private participantsWithStars: MRE.Guid[];
	private startButton: MRE.Actor;
	private spaceID: string;
	private pgDatbase: Database;

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
		this.makeChangingBox({ x: -2, y: 0, z: 0 });
		this.started = false;

		this.participants = [];
		this.participantsWithStars = [];
		//this.makePeriodicBox({x:0,y:0,z:0},this.groupName,this.groupMask);
		//this.makePeriodicBox({x:-1,y:0,z:0},this.groupName2,this.groupMask2);
		this.groupMaskParticipants = new MRE.GroupMask(this.assets.context, [this.participantGroup]);
		this.groupMaskNoParticipants = this.groupMaskParticipants.invert();
		this.makeAllPeriodicBoxes();
		this.makeStartButtonActor({ x: -2, y: 1, z: 0 });
		const arr = this.makeRandomElement();
		this.changeChangingCube(arr[0], arr[1]);

		this.pgDatbase = new Database('postgres://huicwczlmsgele:' +
			'1d083f5711069c994fe5ee8c59ef3023f492bc6da48b0e970c620f4a7aac3cc5' +
			'@ec2-54-78-36-245.eu-west-1.compute.amazonaws.com:5432/d9tje5dt0llf66');
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
			startingX += periodBigBoxSize + margin;
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
		this.hideSides(box, { x: periodBigBoxSize, y: periodBigBoxSize, z: zDimension });
		this.elementBoxes.set(element, box);
	}

	private makeStartButtonActor(position: MRE.Vector3Like) {
		this.startButton = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {
				shape: MRE.PrimitiveShape.Box,
				dimensions: { x: 1.0, y: 0.4, z: 0.02 }
			},
			addCollider: true,
			actor: {
				name: "start",
				transform: { local: { position } }
			}
		});
		this.startButton.collider.layer = MRE.CollisionLayer.Default;

		MRE.Actor.Create(this.assets.context, {
			actor: {
				parentId: this.startButton.id,
				transform: {
					local: {
						position: {
							x: 0, y: 0, z: -0.06,
						}
					}
				},
				text: {
					contents: "Start",
					color: { r: .2, g: .2, b: .2 },
					height: .2,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
				},
				appearance: {
					enabled: this.groupMaskNoParticipants
				}
			}
		});

		MRE.Actor.Create(this.assets.context, {
			actor: {
				parentId: this.startButton.id,
				transform: {
					local: {
						position: {
							x: 0, y: 0, z: -0.06,
						}
					}
				},
				text: {
					contents: "Started",
					color: { r: .2, g: .2, b: .2 },
					height: .2,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
				},
				appearance: {
					enabled: this.groupMaskParticipants
				}
			}
		});
		this.startAssignmentAction();
	}

	private startAssignmentAction() {
		const startAssignmentButton = this.startButton.setBehavior(MRE.ButtonBehavior);
		startAssignmentButton.onClick(user => {
			user.groups.clear();
			this.participants.push(user.id);
			//console.log(this.participants);
			user.groups.add(this.participantGroup);
		});

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
			if (!this.participants.includes(user.id)) {
				return;
			}
			if (box.tag.startsWith("group")) {
				this.makeBox2(box, user);
			}

		});
		button.onHover("exit", (user) => {
			if (!this.participants.includes(user.id)) {
				return;
			}
			const cube = box.children.pop()
			if (cube) {
				cube.destroy();
			}
		});
		button.onClick((user) => {
			if (!this.participants.includes(user.id)) {
				return;
			}
			if (this.currentElement.tag === box.name) {
				//console.log(true);
				box.appearance.materialId = this.currentElement.appearance.materialId;
				const ration = periodBigBoxSize / periodBlackBoxSize;
				box.transform.local.scale = new MRE.Vector3(ration, ration, 1.1);
				//console.log(this.elementBoxesArr.length,this.elementBoxesIndex);
				this.elementBoxesArr[this.elementBoxesIndex].tag = "DONE";
				this.elementBoxesArr.splice(this.elementBoxesIndex, 1);

				//hide of the sides do not work on this???
				//this.hideSides(box,{ x: periodBigBoxSize, y: periodBigBoxSize, z: zDimension });
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

	private hideSides(parent: MRE.Actor, dimensions: MRE.Vector3Like): void {
		const whiteToDelete = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {
				shape: MRE.PrimitiveShape.Box,
				dimensions: {
					x: dimensions.x + 0.001,
					y: dimensions.y + 0.001,
					z: dimensions.z - 0.001
				}
			},
			addCollider: true,
			actor: {
				parentId: parent.id
			}
		});
		whiteToDelete.collider.layer = MRE.CollisionLayer.Navigation;
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
				dimensions: { x: buttonBoxSize, y: buttonBoxSize, z: buttonBoxZSize }
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
		//make white place around the big box so there is no texture visible from sides
		MRE.Actor.CreatePrimitive(this.assets, {
			definition: {
				shape: MRE.PrimitiveShape.Box,
				dimensions: { x: buttonBoxSize + 0.001, y: buttonBoxSize + 0.001, z: buttonBoxZSize - 0.001 }
			},
			addCollider: true,
			actor: {
				parentId: this.centerSpace.id,
				transform: { local: { position: position } }
			}
		})

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
			if (user.properties['altspacevr-roles'] === "") {
				return;
			}
			user.prompt("Set difficulty: 1, 2 or 3.", true)
				.then((value) => {
					this.handleLevelStringInput(value.submitted, value.text, user, false);
				})
				.catch(() => { });
		})
	}

	private handleLevelStringInput(submited: boolean, text: string, user: MRE.User, online: boolean) {
		if (submited) {
			switch (text) {
				case "1":
					this.reloadBoxes("../public/periodicTableEasy.json");
					if (!online) { this.updateDatabase(text, user) }
					break;
				case "2":
					this.reloadBoxes("../public/periodicTableMedium.json");
					if (!online) { this.updateDatabase(text, user) }
					break;
				case "3":
					this.reloadBoxes("../public/periodicTableUltimate.json");
					if (!online) { this.updateDatabase(text, user) }
					// if you want it hard you will have all of them
					break;
				default:
					if (user) {
						user.prompt("Sorry I did not get it, please try again later.");
					}
			}
		}
	}

	/**
	 * function that change this.cubesWanted, this.elementBoxes, this.elementBoxesArr and remake this.elementCube
	 * @param url address to json where are elements that a person will need to put on place
	 */

	private reloadBoxes(url: string) {
		this.cubesWanted = require(url);
		//delete previous boxes
		this.elementBoxes.forEach((value) => {
			value.destroy();
		});
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
	 * what will happen when a user will join, we need to remake everything clickable because of later joiner bug.
	 * I also set the space id if it is not set alredy so the app know altspace identifier.
	 */

	public onUserJoin(user: MRE.User) {
		user.groups.clear();
		if (!this.spaceID) {
			this.spaceID = user.properties['altspacevr-space-id'];
			this.pgDatbase.loadFromDatabase("select * from periodic_level where " +
				"world_id = $1 and session_id = $2", [this.spaceID, this.assets.context.sessionId])
				.then((arr) => {
					//console.log(arr);
					if (arr.length === 1) {
						this.handleLevelStringInput(true, arr[0]['level'], null, true);
					}
				})
		}
		this.elementBoxesArr.forEach((value) => {
			this.makePeriodicBoxAction(value);
		});
		if (this.currentElement) {
			this.changingCubeClickAction()
		}

		if (this.startButton) {
			this.startAssignmentAction();
		}
	}

	/**
	 * function that will make random array of group number and element
	 * @returns array of random cube tag and the name of the cube from array this.elementBoxesArr
	 */

	private makeRandomElement(): string[] { // TO DO make it the way that there will be no duplicates
		if (this.elementBoxesArr.length < 1) {
			this.allElementsTaken();
			return [];
		}
		const randomCubeIndex = Math.floor(Math.random() * this.elementBoxesArr.length);
		const randomCube = this.elementBoxesArr[randomCubeIndex];
		this.elementBoxesIndex = randomCubeIndex;
		//console.log(randomCube.tag);
		return [randomCube.tag, randomCube.name];
	}

	private allElementsTaken() {
		this.currentElement.tag = null;
		this.sendToServer(this.participants);
	}

	private sendToServer(users: MRE.Guid[]) {
		//console.log(users);
		if (!this.spaceID) {
			try {
				this.spaceID = this.assets.context.users[0].properties['altspacevr-space-id'];
			} catch {
				return;
			}
		}
		users.map((user: MRE.Guid) => {
			if (this.participantsWithStars.includes(user)) {
				return;
			}
			//console.log("send to server");
			const userUser = this.assets.context.user(user);
			//console.log(userUser.context,userUser.internal,userUser.properties);
			request.post(
				'https://storstrom-server.herokuapp.com/add',
				{
					json: {
						sessionId: this.spaceID,
						userName: userUser.name,
						userIp: userUser.properties['remoteAddress']
					}
				},
				(err, res, body) => {
					if (err) {
						//console.log(err);
						return;
					}

					//console.log(res.body);
				}
			);
			this.participantsWithStars.push(user);
		})

	}


	/**
	 * function that will change texture of the this.currentElement
	 * @param groupNumber number of group of the element (also name of the folder)
	 * @param element short string of the element name
	 */

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

	private updateDatabase(level: string, user: MRE.User) {
		this.pgDatbase.saveToDatabase('insert into periodic_level (session_id,world_id,level)' +
			' values ($1,$2,$3) ON CONFLICT (session_id, world_id) DO UPDATE SET level=$3;',
			[this.assets.context.sessionId, this.spaceID, level]).catch(() => { })
			.catch(() => { throw new Error("update database not succesfull.") });
	}

}
