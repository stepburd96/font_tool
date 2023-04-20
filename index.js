/* 
    Pre-requisites: 
        Directories: /Users/{user}/Desktop/fonts, /Users/{user}/Desktop/processed-fonts

*/

(function main(path = "./test-fonts") {

    const fk = require("fontkit");
    const fs = require("fs");
    const os = require("os");

    let fontStaging = [];
    let cleanedFontsLog = [];

    // node [entry] [arg1] [arg2] [arg3]
    // [ 'stephen', 'allen' ]
    const args = process.argv.slice(2); 
    const metaFields = ["fullName", "fontFamily", "preferredFamily", "preferredSubfamily"] //preferredSubfamily == weight

    const dskDirtyDir = "Desktop/fonts";
    const dskCleanDir = "Desktop/processed-fonts";
    const userHomeDir = os.homedir();
    let fontSrcDir = args[0];
    fontSrcDir = `${userHomeDir}/${dskDirtyDir}/${fontSrcDir}/`;


    fs.readdir(path, async (err, files) => {
        const { acceptedFiles = [] , failedFiles = [] } = await fontOpeningValidation(files);
        const cleanMetaFonts =  acceptedFiles.map(async (file) => {
            const filePath = path + "/" + file
            let font = fk.openSync(filePath); 
            let fontStage = await fontMetaRevision(font, metaFields);
            fontStage = await fontTTFRevision(font, metaFields)
            fontStage = await fontFileNameRevision(path, filePath, font)
            const fontBuffer = font.stream.buffer
            fk.create(fontBuffer)
            
            return fontStage
        });
    });

})();

function fontOpeningValidation(files) {
    //Filters out every file that isn't in the accepted file type list
    const acceptedFileTypes = [".otf", ".ttf"];
   
    const acceptedFiles = files.filter( (file) => {
        const length = acceptedFileTypes.filter( (ext) => {
            return file.includes(ext)
        }).length;

        return length > 0
    });

    const failedFiles = files.filter( (file) => {
        const length = acceptedFileTypes.filter( (ext) => {
            return file.includes(ext)
        });

        return length == 0
    });

    return { acceptedFiles, failedFiles } 
}

function fontMetaRevision(font, metaFields) {
    //Clean up non-alphanumeric characters in the fields

    for (let i = 0; i < metaFields.length; i++) {
        let field = metaFields[i]

        const re = new RegExp(/[^a-zA-Z0-9]/g);
        const { name : { records } } = font
        let { [field] : meta = "" } = records
        let { en : stage } = meta
        switch(stage) {
            case undefined :
                return 
            default :
                stage = stage.replace(re, "")
                font.name.records[metaFields[i]].en = stage
        }
    }

    return font

}

function fontTTFRevision(font, metaFields) {
    //Use this function to delete erraneous fields - these correspond to FontForges TTF names 

    const { name : { records } } = font
    for (const key in records) {

        if (!metaFields.includes(key)) {
            delete font.name.records[key]
        }
        
    }

    return font

}

function fontFileNameRevision(path , filePath, font) {

    const fs = require("fs");
    const { name : { records } } = font
    const { fullName : { en : fontName } } = records

    fs.rename(filePath, `${path}/${fontName}.ttf`, () => {
        return
    })
}

