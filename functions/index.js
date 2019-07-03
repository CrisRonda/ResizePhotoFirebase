const functions = require("firebase-functions");
const { Storage } = require("@google-cloud/storage");
const projectId = "restaurantrn-d53d2";
const admin = require("firebase-admin");
let gcs = new Storage({ projectId });
const os = require("os");
const path = require("path");
const spawn = require("child-process-promise").spawn;
exports.onFileChange = functions.storage.object().onFinalize(event => {
  console.log(event);
  const bucket = event.bucket;
  const contentType = event.contentType;
  const filePath = event.name;
  const pathImage = path.basename(filePath);
  console.log("Se subio la imagen, procesando ....");

  if (pathImage.startsWith("resized_")) {
    console.log("Ya se renombro la imagen");
    return;
  }
  const destBucket = gcs.bucket(bucket);
  const tmpFilePath = path.join(os.tmpdir(), pathImage);
  const metadata = { contentType };
  return destBucket
    .file(filePath)
    .download({ destination: tmpFilePath })
    .then(() => {
      return spawn("convert", [tmpFilePath, "-resize", "500x500", tmpFilePath]);
    })
    .then(() => {
      return destBucket.upload(tmpFilePath, {
        destination: "resized_" + pathImage,
        metadata
      });
    })
    .then(() => {
      return destBucket.file(filePath).delete();
    });
});

//Loop por reparar la ruta deberia actualizase cuando un user da like a una
exports.onUpdateLikes = functions.database
  .ref("/data/{id}/usersLikes")
  .onUpdate(async change => {
    const { before, after } = change;
    console.log("Hola desde el update!!");
    console.log("ANTES", before.val());
    console.log("DESPUES", after.val());
    const refLikes = after.ref.parent.child("likes");
    console.log(refLikes);
    refLikes.transaction(count => {
      console.log(count);
      return count + 1;
    });
  });

exports.myOwnFunction = functions.https.onRequest((req, res) => {
  console.log(req);
  console.log(res);
  if (req.method === "POST") {
    return res.status(500).json({
      message: "NO PERMITIDO"
    });
  }
  admin
    .database()
    .ref("/data/")
    .on("value", snap => {
      return res.status(200).json({
        message: "FUNCIONA",
        data: snap.val()
      });
    });
  return 0;
});
