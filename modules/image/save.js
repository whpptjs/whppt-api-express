module.exports = {
  exec({ $image, $mongo: { $db }, $id }, { data }) {
    const id = $id();
    const base64Data = new Buffer.from(data.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    return $image.upload(base64Data, id).then(() =>
      $db.collection('images').insertOne({
        id,
        uploadedOn: new Date(),
        name: fileName,
      })
    );

    return $db
      .collection('images')
      .insertOne({
        id,
        uploadedOn: new Date(),
        name: fileName,
      })
      .then(() => $image.upload(data, id));
  },
};

//   exec({ $image, $mongo: { $db }, $id }, image) {
//     const id = $id();
//     const base64Data = new Buffer.from(
//       image.data.replace(/^data:image\/\w+;base64,/, ""),
//       "base64"
//     );

//     const imagePath = `${image.aggregate}/${image.aggregateId}/${id}.${image.type}`;
//     // console.log("TCL: exec -is > image.aggregate", image.aggregate);
//     // console.log("TCL: exec -> image.aggregateId", image.aggregateId);
//     // console.log("TCL: exec -> image.comment", image.comment);
//     // console.log("TCL: exec -> image.type", image.type);

//     const uploadImagePromise = new Promise((resolve, reject) => {
//       s3.$putObject(
//         {
//           Key: imagePath,
//           Body: base64Data,
//           ACL: "public-read",
//           ContentEncoding: "base64",
//           ContentType: `image/${image.type}`
//         },
//         (err, result) => {
//           // console.log("TCL: exec -> result", result);
//           if (err) reject(err);
//           resolve("succesfully uploaded");
//         }
//       );
//     });
//     // Create image document in mongo image collection, return with imageID
//     // update imageID in agg collection (Query based on agg, aggId)
//     return uploadImagePromise.then(() => {
//       return $mongo.then(({ db }) => {
//         return db
//           .collection("images")
//           .insertOne({
//             path: imagePath,
//             id,
//             comment: image.comment,
//             tags: image.tags,
//             user: { id: image.user.id, username: image.user.username },

//             uploadDate: new Date()
//           })
//           .then(() => {
//             console.log("TCL: exec -> tags", image.tags);

//             return db
//               .collection("builds")
//               .updateOne(
//                 { id: image.tags.build },
//                 {
//                   $push: {
//                     events: createEvent("ImageUploaded", {
//                       id,
//                       comment: image.comment,
//                       buildId: image.tags.build
//                     })
//                   }
//                 }
//               )
//               .then(() => {
//                 console.log("task comple ", id);

//                 notifyToAllBuildMembers.exec(context, {
//                   buildId: image.tags.build,
//                   actionMakerUserId: image.user.id,
//                   title: "New photo was uploaded in build",
//                   message:
//                     image.user.username +
//                     " has uploaded a new photo. To see open photo gallery",
//                   badgeCount: 1
//                 });
//                 return id;
//               });
//           });
//       });
//     });
//   }
// };
