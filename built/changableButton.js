"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChangableButton {
    constructor() {
        this.running = true;
    }
    getchangeCallback() {
        return () => { this.running = false; };
    }
    getState() {
        return this.running;
    }
}
exports.default = ChangableButton;
//# sourceMappingURL=changableButton.js.map