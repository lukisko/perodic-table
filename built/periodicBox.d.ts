import * as MRE from '@microsoft/mixed-reality-extension-sdk';
export default class PeriodicTable {
    private assets;
    private position;
    private rotation;
    private currentElement;
    private centerSpace;
    private elementBoxes;
    private elementBoxesArr;
    private elementBoxesIndex;
    private readonly groupName;
    private readonly groupName2;
    private groupMask;
    private groupMask2;
    constructor(assets: MRE.AssetContainer, position: MRE.Vector3Like, rotation?: MRE.QuaternionLike);
    /**
     * this function is going to create all boxes using makePeriodicBox function
     */
    private makeAllPeriodicBoxes;
    makePeriodicBox(position: MRE.Vector3Like, element: string, elementGroup: number, groupMask: MRE.GroupMask): void;
    makePeriodicBoxAction(box: MRE.Actor): void;
    makeChangingBox(position: MRE.Vector3Like): void;
    onUserJoin(): void;
    private makeRandomElement;
    private allElementsTaken;
    private changeChangingCube;
}
//# sourceMappingURL=periodicBox.d.ts.map