const packageRoots = ["./packages", "./tool-packages"];
const cpr = require("cpr").cpr;
//复制根目录的
cpr("./README.md", "docs/README.md", {
    deleteFirst: true, //Delete "to" before
    overwrite: true, //If the file exists, overwrite it
    confirm: true //After the copy, stat all the copied files to make sure they are there
}, function (err, files) {
    //err - The error if any (err.list might be available with an array of errors for more detailed information)
    //files - List of files that we copied
    console.error(err);
})
const path = require("path");
let fromPath;
let toPath;
for (let i = 0; i < packageRoots.length; i++) {
    fromPath = packageRoots[i];
    toPath = path.join("./docs",fromPath);
    cpr(fromPath, toPath, {
        deleteFirst: true, //Delete "to" before
        overwrite: true, //If the file exists, overwrite it
        confirm: true, //After the copy, stat all the copied files to make sure they are there
        // filter: (new RegExp(".json|.ts|.js|node_modules"))
        filter: function (file) {
            if (file.includes("node_modules")) return false;
            if (file.includes(".md")) {
                return true;
            }
            return false;
        }
    }, function (err, files) {
        //err - The error if any (err.list might be available with an array of errors for more detailed information)
        //files - List of files that we copied
        err && console.error(err);
    })
}
