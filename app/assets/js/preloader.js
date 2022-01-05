const {ipcRenderer} = require('electron')
const fs            = require('fs-extra')
const os            = require('os')
const path          = require('path')

const ConfigManager = require('./configmanager')
const VersionManager = require('./versionmanager')
const FabricManager = require('./fabricmanager')
const DistroManager = require('./distromanager')
const LangLoader    = require('./langloader')
const logger        = require('./loggerutil')('%c[Preloader]', 'color: #a02d2a; font-weight: bold')

logger.log('Loading..')

// Load ConfigManager
ConfigManager.load()
VersionManager.load()
//FabricManager.load() dunno

// Load Strings
LangLoader.loadLanguage('en_US')

function onDistroLoad(data){
    if(data != null){
        
        // Resolve the selected server if its value has yet to be set.
        /*
        if(ConfigManager.getSelectedServer() == null || data.getServer(ConfigManager.getSelectedServer()) == null){
            logger.log('Determining default selected server..')
            ConfigManager.setSelectedServer(data.getMainServer().getID())
            ConfigManager.save()
        }*/
    }
    ipcRenderer.send('distributionIndexDone', data != null)
}

FabricManager.pullRemote().then(() => {
    logger.log('Loaded fabric_meta')
}).catch((err) => {
    logger.log('Failed to load fabric_meta')
    logger.error(err)
    //logger.log('Attempting to load an older version of the fabric_meta')
    // Try getting a local copy, better than nothing.
    /*
    FabricManager.pullLocal().then(() => {
        logger.log('Successfully loaded an older version of the fabric_meta')
    }).catch((err) => {

        logger.log('Failed to load an older version of the fabric_meta')
        logger.log('Application cannot run.')
        logger.error(err)

    })*/
})

VersionManager.pullRemote().then(() => {
    logger.log('Loaded version_manifest')
}).catch((err) => {
    logger.log('Failed to load version_manifest')
    logger.error(err)

    logger.log('Attempting to load an older version of the version manifest.')
    // Try getting a local copy, better than nothing.
    VersionManager.pullLocal().then(() => {
        logger.log('Successfully loaded an older version of the version manifest.')

    }).catch((err) => {

        logger.log('Failed to load an older version of the version manifest.')
        logger.log('Application cannot run.')
        logger.error(err)

    })

})

// Ensure Distribution is downloaded and cached.
DistroManager.pullRemote().then((data) => {
    logger.log('Loaded distribution index.')

    onDistroLoad(data)

}).catch((err) => {
    logger.log('Failed to load distribution index.')
    logger.error(err)

    logger.log('Attempting to load an older version of the distribution index.')
    // Try getting a local copy, better than nothing.
    DistroManager.pullLocal().then((data) => {
        logger.log('Successfully loaded an older version of the distribution index.')

        onDistroLoad(data)


    }).catch((err) => {

        logger.log('Failed to load an older version of the distribution index.')
        logger.log('Application cannot run.')
        logger.error(err)

        onDistroLoad(null)

    })

})

function onProfileLoad(){
    // Resolve the selected server if its value has yet to be set.
    if(ConfigManager.getSelectedServer() == null){
        logger.log('Determining default selected server..')
        ConfigManager.setSelectedServer(VersionManager.getProfileByIndex(0).id)
        ConfigManager.save()
    }
}

logger.log('Loaded Profiles')
onProfileLoad()

// Clean up temp dir incase previous launches ended unexpectedly. 
fs.remove(path.join(os.tmpdir(), ConfigManager.getTempNativeFolder()), (err) => {
    if(err){
        logger.warn('Error while cleaning natives directory', err)
    } else {
        logger.log('Cleaned natives directory.')
    }
})