/* 
    Pre-requisites: 
        Directories: /Users/{user}/Desktop/fonts, /Users/{user}/Desktop/processed-fonts

*/

(function main(path = "./test-fonts") {

    const fk = require("fontkit");
    const fs = require("fs");
    const os = require("os");

    //Temp Report Data Structures to pass at end of process
    //possibly setup a logs system that outputs errors to a txt file

    let fontStaging = [];
    let cleanedFontsLog = [];

    //adds arguments to an array
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
    //Return an object of arrays. Failed and Accepted Files listed by font file name as it appears in the directory
    const acceptedFileTypes = [".otf", ".ttf"];
   
    const acceptedFiles = files.filter( (file) => {
        //Take the list of approved file types and compare it against the file. The resulting array will be the extension that was matched. 
        //I could probably do this the other way around but this seems concise enough so I will leave it as is
        //Possibly use .find() for a match but then I would need to split on . grab the last index and use it in .find(). Seems like the same amount of code/iteration(s) over data
        //I prefer this method because I am comparing the extensions against the file string rather than splitting on the hope that there's an extensions
            // I'm working off of what I have in the code rather than what will be passed in to the program
            // Edge case: 'Helvetica' <- IDK if that can happen though
        const length = acceptedFileTypes.filter( (ext) => {
            return file.includes(ext)
        }).length;

        return length > 0
    });


    //Could probably condense both of these down into one function
    const failedFiles = files.filter( (file) => {
        const length = acceptedFileTypes.filter( (ext) => {
            return file.includes(ext)
        });

        return length == 0
    });

    //return only the file names that pass the accepted file types test
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

