import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import changableButton from './changableButton';
import PeriodicTable from './periodicBox';

export default class LearningWorld {
	private assets: MRE.AssetContainer;
	constructor(private context: MRE.Context) {
		this.assets = new MRE.AssetContainer(this.context);

		this.context.onStarted(() => {
			this.started();
		});

		const periodic = new PeriodicTable(this.assets, { x: 0, y: 0, z: 0 });

		this.context.onUserJoined(() => {
			periodic.onUserJoin();
		})
	}

	private started() {

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
