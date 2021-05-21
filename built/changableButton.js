"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class changableButton {
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
exports.default = changableButton;
//# sourceMappingURL=changableButton.js.map