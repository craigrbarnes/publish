import 'regenerator-runtime/runtime';
import { uploadFile, checkStatus } from "./objectManager";

{

    let counts = 0;

    onmessage = async function (event) {
        console.log("worker started", event);
        // upload the the file.
        const res = await uploadFile(event.data);
        console.log("uploadFile", res);
        postMessage(res)

        if (res.status === "uploaded_to_s3") {
            console.log("uploadFile from worker starting check status", res);

            const timer1 = setInterval(async (objectId) => {
                const chk = await checkStatus(objectId);
                postMessage({status : chk.status, msg: chk.uploadStatus, guid: objectId});
                if (chk.uploadStatus === "uploaded") {
                    postMessage({ status: "upload_complete", msg: "upload completed", guid: objectId });
                    clearInterval(timer1);
                   this.close();
                }
                counts += 1;
                if (counts >= 10) {
                    postMessage({ status: "timeout", msg: "cannot determine upload status withing the time allocated", guid: objectId});
                    clearInterval(timer1);
                    this.close();
                }
            }, 3000, res.guid);
        }

    }

}



