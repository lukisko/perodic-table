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
    private groupMaskParticipants;
    private groupMaskNoParticipants;
    private readonly participantGroup;
    private started;
    private cubesWanted;
    private cubesWantedMap;
    private participants;
    private participantsWithStars;
    private startButton;
    private spaceID;
    private pgDatbase;
    constructor(assets: MRE.AssetContainer, position: MRE.Vector3Like, rotation?: MRE.QuaternionLike);
    /**
     * this function is going to create all boxes using makePeriodicBox or makeFinishedPeriodicBox
     * it is needed that the wanted boxes are in this.cubesWantedMap
     */
    private makeAllPeriodicBoxes;
    /**
     * funciton that create a box and put it into this.lementBoxes and this.elementBoxesArr
     * @param position position where is the cube wanted
     * @param element name of the element from pariodic table
     * @param elementGroup tag that is used to know in which folder is the image
     */
    makePeriodicBox(position: MRE.Vector3Like, element: string, elementGroup: number): void;
    /**
     * funciton that create a box and put it into this.lementBoxes
     * @param position position where should the cube be
     * @param element string of the element name according to periodic table
     * @param elementGroup name that will be tag to know in which folder ti find the texture
     */
    makeFinishedPeriodicBox(position: MRE.Vector3Like, element: string, elementGroup: number): void;
    private makeStartButtonActor;
    private startAssignmentAction;
    /**
     * function that will make cube appear to be selected by creating bigger white box
     * @param parent cube that show which cube user point to
     * @param user to which user should be cube exclusive to
     */
    private makeBox2;
    /**
     * function that create clicking action, separated because of later joiner bug
     * @param box actor that will gain the clicking and hover ability
     */
    makePeriodicBoxAction(box: MRE.Actor): void;
    private hideSides;
    /**
     * function that create actor that will show element that a person want to find place for
     * @param position vector that say position where to have the cube
     */
    private makeChangingBox;
    /**
     * action for this.currentElement that will gain click capatibilities
     */
    private changingCubeClickAction;
    private handleLevelStringInput;
    /**
     * function that change this.cubesWanted, this.elementBoxes, this.elementBoxesArr and remake this.elementCube
     * @param url address to json where are elements that a person will need to put on place
     */
    private reloadBoxes;
    /**
     * what will happen when a user will join, we need to remake everything clickable because of later joiner bug.
     * I also set the space id if it is not set alredy so the app know altspace identifier.
     */
    onUserJoin(user: MRE.User): void;
    /**
     * function that will make random array of group number and element
     * @returns array of random cube tag and the name of the cube from array this.elementBoxesArr
     */
    private makeRandomElement;
    private allElementsTaken;
    private sendToServer;
    /**
     * function that will change texture of the this.currentElement
     * @param groupNumber number of group of the element (also name of the folder)
     * @param element short string of the element name
     */
    private changeChangingCube;
    private updateDatabase;
}
//# sourceMappingURL=periodicBox.d.ts.map