import React, {useState} from 'react';
import {Label, Form, Input, Button, Checkbox, Upload, message} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import EditableTagGroup from "../EditableTagGroup";
import {mdsapiPath} from '../../localconf';
import 'antd/dist/antd.css';
import './Publish.css';
import Worker from './loader.worker';

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 18,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 4,
        span: 24,
    },
};

function Publish(props) {

    const [useDOI, setUseDOI] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({status: "ready", msg: "", guid: null});


    const onFinish = async (values) => {
        setUploadStatus({status: "ready", guid: null});
        const worker = new Worker("./loader.worker.js");
        worker.onerror = (err) => setUploadStatus({status: "error"});
        worker.onmessage = (msg) => {
            console.log(msg.data.status);
            setUploadStatus(msg.data);

        }
        worker.postMessage(values);
    };

    return (
        <div>
            <Form
                {...layout}
                name="basic"
                onFinish={onFinish}
            >
                <Form.Item
                    label="File"
                    name="file"
                    rules={[{
                        required: true,
                        message: 'Please input or browse a file'
                    }]}
                >
                    <Upload {...props} beforeUpload={(file) => {
                        return false;
                    }} customRequest={(file, onSuccess) => {
                        setTimeout(() => {
                            onSuccess("ok");
                        }, 0)
                    }}>
                        <Button icon={<UploadOutlined/>}>Click to Add</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{required: true, message: 'Please add a title'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="License"
                    name="license"
                    initialValue="GPL3"
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Tags"
                    name="tags"
                >
                    <EditableTagGroup onChange={(tags) => tags}/>
                </Form.Item>
                <Form.Item
                    label="Add DOI"
                    name="useDOI"
                    className="input-content-tight"
                >
                    <Checkbox></Checkbox>
                </Form.Item>
                <Form.Item {...tailLayout} className="input-content-tight">
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

            <div className='upload-status-container'>
                {

                    {
                    'ready': <p>ready</p>,
                    'upload_complete': <p>File successfully uploaded and available at: <a
                        href={`${mdsapiPath}metadata/${uploadStatus.guid}`}>metadata entry </a></p>,
                    'uploaded_to_s3': <p>File uploaded to S3. indexing...</p>,
                        'status_check_ok' : <p>{`Status: ${uploadStatus.msg}`}</p>,
                    "error": <p>{`error: ${uploadStatus.msg}`}</p>,
                    "ok": <p>{`${uploadStatus.msg}`}</p>,
                }[uploadStatus.status]
                }
            </div>
        </div>
    );
}


export default Publish;
