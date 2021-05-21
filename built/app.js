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
const periodicBox_1 = __importDefault(require("./periodicBox"));
class LearningWorld {
    constructor(context) {
        this.context = context;
        this.assets = new MRE.AssetContainer(this.context);
        this.context.onStarted(() => {
            this.started();
        });
        const periodic = new periodicBox_1.default(this.assets, { x: 0, y: 0, z: 0 });
        this.context.onUserJoined(() => {
            periodic.onUserJoin();
        });
    }
    started() {
        /*MRE.Actor.Create(this.context,{
            actor:{
                text:{
                    contents:'Hello',
                    anchor: MRE.TextAnchorLocation.MiddleCenter
                }
            }
        });
        const button = new changableButton();
        const toTrigger = button.getchangeCallback();
        console.log(toTrigger);
        toTrigger(true);
        console.log("here");
        console.log(button.getState());*/
    }
}
exports.default = LearningWorld;
//# sourceMappingURL=app.js.map