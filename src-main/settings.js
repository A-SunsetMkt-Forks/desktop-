const fs = require('fs');
const path = require('path');
const {app} = require('electron');
const {writeFileAtomic} = require('./atomic-write-stream');

const PATH = path.resolve(app.getPath('userData'), 'tw_config.json');

const migrateLegacyData = (legacyData) => {
  const options = {
    unmigrated: true
  };
  if (legacyData.bypass_cors === true) {
    options.bypassCORS = true;
  }
  if (legacyData.hardware_acceleration === false) {
    options.hardwareAcceleration = false;
  }
  if (legacyData.background_throttling === false) {
    options.backgroundThrottling = false;
  }
  return options;
};

class Settings {
  constructor () {
    try {
      const parsedFile = JSON.parse(fs.readFileSync(PATH, 'utf-8'));
      if (!parsedFile) throw new Error('data is null');

      if (parsedFile.v2) {
        this.data = parsedFile.v2;
      } else {
        this.data = migrateLegacyData(parsedFile);
      }
    } catch (e) {
      // File does not exist or is corrupted
      this.data = {};
    }
  }

  async save () {
    const serialized = {
      v2: this.data
    };
    console.log('Saving', serialized);
    await writeFileAtomic(PATH, JSON.stringify(serialized, null, 2));
  }

  get unmigrated () {
    return !!this.data.unmigrated;
  }
  set unmigrated (unmigrated) {
    if (unmigrated) {
      throw new Error('unmigrated can only be disabled');
    }
    delete this.data.unmigrated;
  }

  get lastVersion () {
    return this.data.lastVersion || '0.0.0';
  }
  set lastVersion (lastVersion) {
    this.data.lastVersion = lastVersion;
  }

  get updateChecker () {
    return this.data.updateChecker || 'stable';
  }
  set updateChecker (updateChecker) {
    this.data.updateChecker = updateChecker;
  }

  get camera () {
    return this.data.camera || null;
  }
  set camera (camera) {
    this.data.camera = camera;
  }

  get microphone () {
    return this.data.microphone || null;
  }
  set microphone (microphone) {
    this.data.microphone = microphone;
  }

  get bypassCORS () {
    return this.data.bypassCORS === true;
  }
  set bypassCORS (bypassCORS) {
    this.data.bypassCORS = bypassCORS;
  }

  get hardwareAcceleration () {
    return this.data.hardwareAcceleration !== false;
  }
  set hardwareAcceleration (hardwareAcceleration) {
    this.data.hardwareAcceleration = hardwareAcceleration;
  }

  get backgroundThrottling () {
    return this.data.backgroundThrottling !== false;
  }
  set backgroundThrottling (backgroundThrottling) {
    this.data.backgroundThrottling = backgroundThrottling;
  }
}

const settings = new Settings();

if (!settings.hardwareAcceleration) {
  app.disableHardwareAcceleration();
}

module.exports = settings;
