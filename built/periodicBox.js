"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MRE = __importStar(require("@microsoft/mixed-reality-extension-sdk"));
const request_1 = __importDefault(require("request"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const periodicTableInfo = require('../public/periodicTable.json');
const buttonBoxSize = 1;
const buttonBoxZSize = 0.03;
const periodBlackBoxSize = 0.1;
const periodicWhiteBoxSize = 0.15;
const periodBigBoxSize = 0.4;
const margin = 0;
const zDimension = 0.03;
class PeriodicTable {
    constructor(assets, position, rotation = { x: 0, y: 0, z: 0, w: 1 }) {
        this.assets = assets;
        this.groupName = "TEST";
        this.groupName2 = "Cs";
        this.participantGroup = "PARTICIPANTS";
        this.position = position;
        this.rotation = rotation;
        this.centerSpace = MRE.Actor.Create(this.assets.context, {
            actor: {
                transform: { app: { position: this.position, rotation: this.rotation } }
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        this.cubesWanted = require("../public/periodicTableUltimate.json");
        this.cubesWantedMap = new Map();
        for (let i = 0; i < this.cubesWanted.length; i++) {
            const str = this.cubesWanted[i];
            this.cubesWantedMap.set(str, str);
        }
        this.elementBoxesArr = [];
        this.elementBoxes = new Map();
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
        //console.log(periodicTableInfo);
    }
    /**
     * this function is going to create all boxes using makePeriodicBox or makeFinishedPeriodicBox
     * it is needed that the wanted boxes are in this.cubesWantedMap
     */
    makeAllPeriodicBoxes() {
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
                }
                else {
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
    makePeriodicBox(position, element, elementGroup) {
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
    makeFinishedPeriodicBox(position, element, elementGroup) {
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
    makeStartButtonActor(position) {
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
    startAssignmentAction() {
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
    makeBox2(parent, user) {
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
        });
    }
    /**
     * function that create clicking action, separated because of later joiner bug
     * @param box actor that will gain the clicking and hover ability
     */
    makePeriodicBoxAction(box) {
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
            const cube = box.children.pop();
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
        });
    }
    hideSides(parent, dimensions) {
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
    makeChangingBox(position) {
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
        });
        this.changingCubeClickAction();
    }
    /**
     * action for this.currentElement that will gain click capatibilities
     */
    changingCubeClickAction() {
        const cubeButton = this.currentElement.setBehavior(MRE.ButtonBehavior);
        cubeButton.onClick((user) => {
            if (this.started) {
                return;
            }
            user.prompt("difficulty? (0,1 or 2)", true)
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
            });
        });
    }
    /**
     * function that change this.cubesWanted, this.elementBoxes, this.elementBoxesArr and remake this.elementCube
     * @param url address to json where are elements that a person will need to put on place
     */
    reloadBoxes(url) {
        this.cubesWanted = require(url);
        //delete previous boxes
        this.elementBoxes.forEach((value) => {
            value.destroy();
        });
        this.cubesWantedMap = new Map();
        for (let i = 0; i < this.cubesWanted.length; i++) {
            const str = this.cubesWanted[i];
            this.cubesWantedMap.set(str, str);
        }
        this.elementBoxes = new Map();
        this.elementBoxesArr = [];
        this.makeAllPeriodicBoxes();
        const arr = this.makeRandomElement();
        this.changeChangingCube(arr[0], arr[1]);
    }
    /**
     * what will happen when a user will join, we need to remake everithing clickable because of leter joiner bug
     */
    onUserJoin(user) {
        user.groups.clear();
        if (!this.spaceID) {
            this.spaceID = user.properties['altspacevr-space-id'];
        }
        this.elementBoxesArr.forEach((value) => {
            this.makePeriodicBoxAction(value);
        });
        if (this.currentElement) {
            this.changingCubeClickAction();
        }
        if (this.startButton) {
            this.startAssignmentAction();
        }
    }
    /**
     * function that will make random array of group number and element
     * @returns array of random cube tag and the name of the cube from array this.elementBoxesArr
     */
    makeRandomElement() {
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
    allElementsTaken() {
        //TODO what to do if all of them are on its place
        this.currentElement.tag = null;
        this.sendToServer(this.participants);
    }
    sendToServer(users) {
        //TODO
        //console.log(users);
        if (!this.spaceID) {
            try {
                this.spaceID = this.assets.context.users[0].properties['altspacevr-space-id'];
            }
            catch (_a) {
                return;
            }
        }
        users.map((user) => {
            if (this.participantsWithStars.includes(user)) {
                return;
            }
            //console.log("send to server");
            const userUser = this.assets.context.user(user);
            //console.log(userUser.context,userUser.internal,userUser.properties);
            request_1.default.post('https://storstrom-server.herokuapp.com/add', {
                json: {
                    sessionId: this.spaceID,
                    userName: userUser.name,
                    userIp: userUser.properties['remoteAddress']
                }
            }, (err, res, body) => {
                if (err) {
                    //console.log(err);
                    return;
                }
                //console.log(res.body);
            });
            this.participantsWithStars.push(user);
        });
    }
    /**
     * function that will change texture of the this.currentElement
     * @param groupNumber number of group of the element (also name of the folder)
     * @param element short string of the element name
     */
    changeChangingCube(groupNumber, element) {
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
exports.default = PeriodicTable;
//# sourceMappingURL=periodicBox.js.map