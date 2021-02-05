const fs = require('fs');
const os = require('os');
const path = require('path');
const child_process = require('child_process');

// node-abi is still shipping the wrong data
// correct this issue manually for now
const prebuildPkgPath = path.dirname(require.resolve('prebuild'));
const nodeAbiPkgPath = path.dirname(require.resolve('node-abi'));
const prebuildPath = path.resolve(prebuildPkgPath, 'bin.js');
const abiRegistryJsonPath = path.resolve(nodeAbiPkgPath, 'abi_registry.json');
fs.copyFileSync(path.resolve(__dirname, 'abi_registry.json'), abiRegistryJsonPath);

const cwd = path.resolve(__dirname, '../');

// common windows flags
const winBuildOpts = [
  '--include-regex',
  '"\.(node|exe|dll|pdb)$"',
]

/**
 * --------------- Node.js Build ---------------
 */

// define build targets
const nodeBuildTargets = [
  '-t',
  '10.0.0',
  '-t',
  '11.0.0',
  '-t',
  ' 12.0.0',
  '-t',
  '13.0.0',
  '-t',
  '14.0.0',
  '-t',
  '15.0.0',
]

const nodeBuildCmd = [
  prebuildPath,
  ...nodeBuildTargets,
]

if (os.platform() === 'win32') {
  nodeBuildCmd.push(...winBuildOpts);
}

console.log('Building for Node.js:');
console.log(nodeBuildCmd.join(' '));

try {
  child_process.spawnSync(process.execPath, nodeBuildCmd, {
    cwd: cwd,
    stdio: ['inherit', 'inherit', 'inherit']
  });

  // build i386?
  if ((os.platform() === 'linux' && os.arch() === 'x64' && fs.existsSync('/usr/bin/apt')) || os.platform() === 'win32') {
    nodeBuildCmd.push('-a', 'ia32');

    child_process.spawnSync(process.execPath, nodeBuildCmd, {
      cwd: cwd,
      stdio: ['inherit', 'inherit', 'inherit']
    });
  }
} catch (e) {
  console.error(e);
  return;
}

/** 
 * --------------- Electron Build ---------------
 */

const electronBuildTargets = [
  '-t',
  '5.0.0',
  '-t',
  '6.0.0',
  '-t',
  '7.0.0',
  '-t',
  '8.0.0',
  '-t',
  '9.0.0',
  '-t',
  '10.0.0',
  '-t',
  '11.0.0',
]

const electronBuildCmd = [
  prebuildPath,
  '-r',
  'electron',
  ...electronBuildTargets,
]

if (os.platform() === 'win32') {
  electronBuildCmd.push(...winBuildOpts);
}

console.log('Building for Electron:');
console.log(electronBuildCmd.join(' '));

try {
  child_process.spawnSync(process.execPath, electronBuildCmd, {
    cwd: cwd,
    stdio: ['inherit', 'inherit', 'inherit']
  });

  if ((os.platform() === 'linux' && os.arch() === 'x64' && fs.existsSync('/usr/bin/apt')) || os.platform() === 'win32') {
    electronBuildCmd.push('-a', 'ia32');

    child_process.spawnSync(process.execPath, electronBuildCmd, {
      cwd: cwd,
      stdio: ['inherit', 'inherit', 'inherit']
    });
  }
} catch (e) {
  return;
}