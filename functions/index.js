const functions = require("firebase-functions");
const { Storage } = require("@google-cloud/storage");
const projectId = "restaurantrn-d53d2";
let gcs = new Storage({ projectId });
const os = require("os");
const path = require("path");
const spawn = require("child-process-promise").spawn;
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.onFileChange = functions.storage.object().onFinalize(event => {
  console.log(event);
  const bucket = event.bucket;
  const contentType = event.contentType;
  const filePath = event.name;
  console.log("Se subio la imagen, procesando ....");

  if (path.basename(filePath).startsWith("resized_")) {
    console.log("Ya se renombro la imagen");
    return;
  }
  const destBucket = gcs.bucket(bucket);
  const tmpFilePath = path.join(os.tmpdir(), path.basename(filePath));
  const metadata = { contentType };
  return destBucket
    .file(filePath)
    .download({ destination: tmpFilePath })
    .then(() => {
      return spawn("convert", [tmpFilePath, "-resize", "500x500", tmpFilePath]);
    })
    .then(() => {
      return destBucket.upload(tmpFilePath, {
        destination: "resized_" + path.basename(filePath),
        metadata
      });
    });
});
