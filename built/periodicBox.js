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
Object.defineProperty(exports, "__esModule", { value: true });
const MRE = __importStar(require("@microsoft/mixed-reality-extension-sdk"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const periodicTableInfo = require('../public/periodicTable.json');
const buttonBoxSize = 1;
const periodBlackBoxSize = 0.1;
const periodicWhiteBoxSize = 0.15;
const periodBigBoxSize = 0.4;
const margin = 0;
class PeriodicTable {
    constructor(assets, position, rotation = { x: 0, y: 0, z: 0, w: 1 }) {
        this.assets = assets;
        this.groupName = "TEST";
        this.groupName2 = "Cs";
        this.position = position;
        this.rotation = rotation;
        this.centerSpace = MRE.Actor.Create(this.assets.context, {
            actor: {
                transform: { app: { position: this.position, rotation: this.rotation } }
            }
        });
        this.elementBoxesArr = [];
        this.elementBoxes = new Map();
        this.makeChangingBox({ x: 2, y: 0, z: 0 });
        //this.makePeriodicBox({x:0,y:0,z:0},this.groupName,this.groupMask);
        //this.makePeriodicBox({x:-1,y:0,z:0},this.groupName2,this.groupMask2);
        this.makeAllPeriodicBoxes();
        //console.log(periodicTableInfo);
    }
    /**
     * this function is going to create all boxes using makePeriodicBox function
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
    makePeriodicBox(position, element, elementGroup, groupMask) {
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
    makePeriodicBoxAction(box) {
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
                this.changeChangingCube(arr[0], arr[1]); //TODO
            }
        });
    }
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
                    local: { position: { x: 0, y: 0, z: -buttonBoxSize / 2 + 0.05 } }
                }
            }
        });
    }
    onUserJoin() {
        this.elementBoxes.forEach((value) => {
            this.makePeriodicBoxAction(value);
        });
    }
    makeRandomElement() {
        if (this.elementBoxesArr.length < 1) {
            return [];
        }
        const randomCubeIndex = Math.floor(Math.random() * this.elementBoxesArr.length);
        const randomCube = this.elementBoxesArr[randomCubeIndex];
        this.elementBoxesIndex = randomCubeIndex;
        return [randomCube.tag, randomCube.name];
    }
    allElementsTaken() {
        //TODO
    }
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