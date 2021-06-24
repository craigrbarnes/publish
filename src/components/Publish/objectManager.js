import { userapiPath,mdsapiPath, apiKey, keyID } from '../../localconf';

export const getUserToken = async () => {
    try {
        const url = `${userapiPath}credentials/api/access_token`;
        const res = await fetch(url,
            {
                method: "POST",
                body: JSON.stringify({
                    "api_key": apiKey,
                    "key_id": keyID
                }),
                headers: {"Content-type": "application/json; charset=UTF-8"}
            }
        );
        if (res.status !== 200) {
            return {
                status: "error",
                msg: "Token request failed"
            };
            // throw new Error(`Request for user token at ${url} failed. Response: ${JSON.stringify(res, null, 2)}`);
        }
        const jsonResponse = await res.json();
        return {
            status: "ok",
            msg: "received token",
            token: jsonResponse['access_token']
        }

    } catch (err) {
       //  throw new Error(`Request for user token failed: ${err}`);
        return {
            status: "error",
            msg: "Token request failed"
        };
    }
}

export const uploadFile = async(params) => {
    try {
        // build the metadata payload
        const payload = new Object({
            aliases: [ `publish__${Math.floor(Math.random() * 100000)}_${params.file.file.name}` ],
            authz: {
                version : 0,
                resource_paths : ["/programs/DEV"]
            },
            metadata: {
                title: params.title,
                description: params.description,
                tags: params.tags,
                license: params.license
            },
            file_name: params.file.file.name
        })

        // get the auth token
        const results = await getUserToken();
        if (results.status != "ok") {
            return results;
        }

        // get file information
        const req_response = await uploadSingleRequest(payload, results.token);
        if (req_response.status != "ok") {
            return req_response;
        }
        // get the url and upload

        const upload_res = await uploadSingle(params.file.file, req_response.upload_url);

        return {...upload_res, guid: req_response['guid']};

    } catch (err) {
        // throw new Error(`Request upload failed: ${err}`);
        return {
            status: "error",
            msg: "Upload failed"
        };
    }
}

const uploadSingleRequest = async(body, token) => {
    try {
        const url = `${mdsapiPath}objects`;
        const res = await fetch(url,
            {
                method: "POST",
                body: JSON.stringify(body),
                headers: {"Content-type": "application/json",
                    "Authorization" : `Bearer ${token}`
                }
            }
        );
        if (res.status !== 201) { //
            return {
                status: "error",
                msg: "upload request failed"
            }
            // throw new Error(`Request for upload ${url} failed. Response: ${JSON.stringify(res, null, 2)}`);
        }
        const jsonResponse = await res.json();
        return {
            status: "ok",
            msg: "upload request approved",
            guid: jsonResponse.guid,
            upload_url: jsonResponse.upload_url
        };

    } catch (err) {
        return {
            status: "error",
            msg: "Upload request failed"
        };
    }
}


const readUploadedFileAsDataURL = (inputFile) => {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };
        temporaryFileReader.readAsDataURL(inputFile);
    });
};

export const uploadSingle = async (file, url) => {

    console.log(url);
    try {
        let filedata = 0;
        try {
            filedata = await readUploadedFileAsDataURL(file)
        } catch (e) {
            console.warn(e.message);
            return {
                status: "error",
                msg: "Cannot access upload file."
            }
        }

        const res = await fetch(url,
            {
                method: "PUT",
                body: filedata,
                headers: {"Content-type": "application/octet-stream" }
            }
        );

        if (res.status !== 200) {
            return {
                status: "error",
                msg: "Upload to S3 failed."
            }
         }

        return {
            status: "uploaded_to_s3",
            msg: "Upload to s3 succeeded."
        }
    } catch (err) {
        return {
            status: "error",
            msg: "Upload to S3 failed."
        }
    }
}

export const  checkStatus = async (objectId) => {
    const url = `${mdsapiPath}metadata/${objectId}`;

    const results =  await fetch(url,
        {
            method: "GET",
            headers: {"Content-type": "application/json" }
        }
    ).then(res => res.json()).then(jsonResponse =>  {
        return {
            status: "status_check_ok",
            uploadStatus: jsonResponse._upload_status
        }})
    return results;

    // if (res.status !== 200) { //
    //     return {
    //         status: "error",
    //         msg: "query status request failed"
    //     }
    // }
    //
    // }
    // const jsonResponse = await res.json();
    // console.log("check upload status: ", jsonResponse);
    // return {
    //     status: "success",
    //     msg: jsonResponse._upload_status
    // }

}
