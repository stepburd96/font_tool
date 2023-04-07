/* 
    Pre-requisites: 
        Directories: /Users/{user}/Desktop/fonts, /Users/{user}/Desktop/processed-fonts

*/

//slowly import line by line and check for errors
//test slowly
//try to pass command line arguments to node js program

const f = require("fonteditor-core");
const fs = require("fs");
const os = require("os");

//Temp Report Data Structures to pass at end of process
//possibly setup a logs system that outputs errors to a txt file

let failedFilesLog = [];
let fontStaging = [];
let cleanedFontsLog = [];

//adds arguments to an array
// node [entry] [arg1] [arg2] [arg3]
// [ 'stephen', 'allen' ]
const args = process.argv.slice(2);

const dskDirtyDir = "Desktop/fonts";
const dskCleanDir = "Desktop/processed-fonts";
const userHomeDir = os.homedir();
let fontSrcDir = args[0];
fontSrcDir = `${userHomeDir}/${dskDirtyDir}/${fontSrcDir}/`;

function main(path = "./test-fonts") {
  return fs.opendir(path, { encoding: "utf8", bufferSize: 64 }, (err, dir) => {
    let path = dir.path;
    fs.readdir(path, (err, files) => {
        //We got to the actual font files (hopefully), lets start validating
        //I might want to do this somewhere else
        files = fontOpeningValidation(files)

        console.log('post filter files: ', files)
    });
    console.log("Closing the directory");
    dir.closeSync();
  });
}

function fontOpeningValidation(files) {
    //Filters out every file that isn't in the accepted file type list
    //Return a Bool


    const acceptedFileTypes = [".otf", ".ttf"];
    files = files.filter( (file) => {

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

    failedFilesLog = files.filter( (file) => {
        const length = acceptedFileTypes.filter( (ext) => {
            return file.includes(ext)
        });
    });


    //return only the file names that pass the accepted file types test
    return files
}

function fontMetaRevision(file) {}

function fontSFNTRevision(file) {}

function fontFileNameRevision(file) {}

main();
