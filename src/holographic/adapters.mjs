import { createDeviceDescriptor, validateSceneForDevice } from './contracts.mjs';

export class SimulatedProjectorAdapter {
  constructor(descriptor = {}) {
    this.device = createDeviceDescriptor({ ...descriptor, type: 'projector', simulated: true });
    this.render = this.render.bind(this);
  }

  async connect() {
    return this.device;
  }

  async render(scene) {
    const compatibility = validateSceneForDevice(scene, this.device);
    if (!compatibility.compatible) throw new Error(`Scene requires unsupported capabilities: ${compatibility.missing.join(', ')}`);
    return Object.freeze({ deviceId: this.device.id, sceneId: scene.id, status: 'rendered', simulated: true });
  }

  async disconnect() {
    return { deviceId: this.device.id, status: 'disconnected' };
  }
}

export class SimulatedHoloMatAdapter {
  constructor(descriptor = {}) {
    this.device = createDeviceDescriptor({ ...descriptor, type: 'holomat', simulated: true });
    this.mapScene = this.mapScene.bind(this);
  }

  async connect() {
    return this.device;
  }

  async mapScene(scene) {
    const compatibility = validateSceneForDevice(scene, this.device);
    if (!compatibility.compatible) throw new Error(`Scene requires unsupported capabilities: ${compatibility.missing.join(', ')}`);
    return Object.freeze({ deviceId: this.device.id, sceneId: scene.id, status: 'mapped', simulated: true });
  }

  async disconnect() {
    return { deviceId: this.device.id, status: 'disconnected' };
  }
}

export class SimulatedThreeDPlatformAdapter {
  constructor(descriptor = {}) {
    this.device = createDeviceDescriptor({ ...descriptor, type: 'three-d-platform', simulated: true });
    this.stage = this.stage.bind(this);
  }

  async connect() {
    return this.device;
  }

  async stage(scene) {
    const compatibility = validateSceneForDevice(scene, this.device);
    if (!compatibility.compatible) throw new Error(`Scene requires unsupported capabilities: ${compatibility.missing.join(', ')}`);
    return Object.freeze({ deviceId: this.device.id, sceneId: scene.id, status: 'staged', simulated: true });
  }

  async disconnect() {
    return { deviceId: this.device.id, status: 'disconnected' };
  }
}
