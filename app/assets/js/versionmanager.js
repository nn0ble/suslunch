const { profile } = require('console')
const fs   = require('fs-extra')
const os   = require('os')
const path = require('path')

const ConfigManager = require('./configmanager')

const logger = require('./loggerutil')('%c[VersionManager]', 'color: #a02d2a; font-weight: bold')

const sysRoot = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME)
const dataPath = path.join(sysRoot, '.featherlauncher')

const launcherDir = process.env.CONFIG_DIRECT_PATH || require('@electron/remote').app.getPath('userData')


exports.getLauncherDirectory = function(){
    return launcherDir
}

/**
 * Get the launcher's data directory. This is where all files related
 * to game launch are installed (common, instances, java, etc).
 * 
 * @returns {string} The absolute path of the launcher's data directory.
 */
exports.getDataDirectory = function(def = false){
    return !def ? config.settings.launcher.dataDirectory : DEFAULT_CONFIG.settings.launcher.dataDirectory
}

/**
 * Set the new data directory.
 * 
 * @param {string} dataDirectory The new data directory.
 */
exports.setDataDirectory = function(dataDirectory){
    config.settings.launcher.dataDirectory = dataDirectory
}


const configPath = path.join(launcherDir, 'profiles.json')
const configPathLEGACY = path.join(dataPath, 'profiles.json')

const DEFAULT_CONFIG = {

    profiles: [
        {
            id: 1,
            name: "Test",
            description: "",
            icon: "url",
            version: "1.18.1"
        },
        {
            id: 2,
            name: "Test2",
            description: "",
            icon: "url",
            version: "1.18.1"
        }
    ]
}

let config = null

// Persistance Utility Functions

/**
 * Save the current configuration to a file.
 */
exports.save = function(){
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'UTF-8')
}

/**
 * Load the configuration into memory. If a configuration file exists,
 * that will be read and saved. Otherwise, a default configuration will
 * be generated. Note that "resolved" values default to null and will
 * need to be externally assigned.
 */
 exports.load = function(){
    let doLoad = true

    if(!fs.existsSync(configPath)){
        // Create all parent directories.
        fs.ensureDirSync(path.join(configPath, '..'))
        if(fs.existsSync(configPathLEGACY)){
            fs.moveSync(configPathLEGACY, configPath)
        } else {
            doLoad = false
            config = DEFAULT_CONFIG
            exports.save()
        }
    }
    if(doLoad){
        let doValidate = false
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'))
            doValidate = true
        } catch (err){
            logger.error(err)
            logger.log('Configuration file contains malformed JSON or is corrupt.')
            logger.log('Generating a new configuration file.')
            fs.ensureDirSync(path.join(configPath, '..'))
            config = DEFAULT_CONFIG
            exports.save()
        }
        exports.save
    }
    logger.log('Successfully Loaded')
}
/**
 * @returns {boolean} Whether or not the manager has been loaded.
 */
exports.isLoaded = function(){
    return config != null
}

/**
 * Validate that the destination object has at least every field
 * present in the source object. Assign a default value otherwise.
 * 
 * @param {Object} srcObj The source object to reference against.
 * @param {Object} destObj The destination object.
 * @returns {Object} A validated destination object.
 */

/**
 * Check to see if this is the first time the user has launched the
 * application. This is determined by the existance of the data path.
 * 
 * @returns {boolean} True if this is the first launch, otherwise false.
 */

/**
 * Returns the name of the folder in the OS temp directory which we
 * will use to extract and store native dependencies for game launch.
 * 
 * @returns {string} The name of the folder.
 */
exports.getTempNativeFolder = function(){
    return 'WCNatives'
}

// System Settings (Unconfigurable on UI)

/**
 * Retrieve the common directory for shared
 * game files (assets, libraries, etc).
 * 
 * @returns {string} The launcher's common directory.
 */
exports.getCommonDirectory = function(){
    return path.join(exports.getDataDirectory(), 'common')
}

exports.getID= function(index){
    return config.profiles[index].id
}

exports.getIcon = function(index){
    return config.profiles[index].icon
}

exports.getName = function(index){
    return config.profiles[index].name
}

exports.getDescription = function(index){
    return config.profiles[index].description
}

exports.getVersion = function(index){
    return config.profiles[index].version
}

exports.isMainProfile = function(index) {
    return config.profiles[index].isMainProfile
}

exports.amountOfProfiles = function() {
    return Object.keys(config.profiles).length
}

exports.getMainProfile = function() {
    for(x = 0; x < this.amountOfProfiles(); ++x) {
        if (config.profiles[x].mainServer) {
            return config.profiles[x]
        }
    }
}

exports.getProfile = function(id) {
    for(const profile of config.profiles) {
        if(profile.id == id) {
            return profile
        } 
    }
}