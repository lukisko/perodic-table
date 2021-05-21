import * as MRE from '@microsoft/mixed-reality-extension-sdk';

export default class changableButton{
    private running: boolean;
    constructor(){//createObject: () => MRE.Actor
        this.running = true;
    }

    public getchangeCallback(): (something:boolean)=> void{
        return () =>{this.running = false};
    }
    public getState(): boolean{
        return this.running;
    }
}