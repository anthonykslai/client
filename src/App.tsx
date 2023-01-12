import './App.css';
import React, { useEffect, useState } from 'react';
import './index.css';
import { Divider, Row, Col } from "antd";

export enum RespType {
    Text,
    Json
}

type Right = {
    summary: string;
}

const noRight: Right = {
    summary: ''
};

type Time = {
    properties: {
        epoch: {
            description: string,
            type: number
        }
    },
    required: [],
    type: string
}

const App: React.FC = () => {
    const [time, setTime] = useState<Time>();
    const [metrics, setMetrics] = useState(String);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        Fetch("http://localhost:4000/metrics", RespType.Text);
        setInterval(() => Fetch("http://localhost:4000/metrics", RespType.Text), 10000)


        Fetch("http://localhost:4000/time", RespType.Json);
        // setInterval(() => Fetch("http://localhost:4000/time", RespType.Json), 30000)

        let check = time?.properties.epoch.type;
        console.log("check: "+check);

        // fetch("http://localhost:4000/time", {
        //     method: 'GET',
        //     headers: {
        //         'Authorization': 'mysecrettoken',
        //         'Access-Control-Allow-Origin': '*'
        //     }
        // })
        //     .then(async response => {
        //         const isJson = response.headers.get('content-type')?.includes('application/json');
        //         const data = isJson && await response.json();

        //         console.log("time: " + JSON.stringify(data));
        //         // check for error response
        //         if (!response.ok) {
        //             // get error message from body or default to response status
        //             const error = (data && data.message) || response.status;
        //             return Promise.reject(error);
        //         }

        //     })
        //     .catch(error => {
        //         console.error('There was an error!', error);
        //     });
        function Fetch(url: string, type: RespType) {
            setLoading(true);

            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'mysecrettoken',
                    'Access-Control-Allow-Origin': '*'
                }
            })
                .then(async response => {
                    const isJson = response.headers.get('content-type')?.includes('application/json');
                    if (type == RespType.Json) {
                        const result = isJson && await response.json();
                        setTime(result);
                    } else if (type == RespType.Text) {
                        const result = await response.text()
                        setMetrics(result.replace(/\n/g, "<br />"));
                    }

                    // check for error response
                    if (!response.ok) {
                        // get error message from body or default to response status
                        return Promise.reject(response.status);
                    }
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);
                    console.error('There was an error!', error);
                })
        }
    }, [])

    return (
        <div>
            {loading ?
                (<div>Loading...</div>) : (
                    <Row>
                        <Col span={11}>Fetched value for server time <br />
                        {time?.properties.epoch.description}  <br /></Col>
                        <Col className='height-500'>
                            <Divider type="vertical" className='height-100' />
                        </Col>
                        <Col span={11}>Fetched value of all Prometheus metrics <br />
                        <p dangerouslySetInnerHTML={{__html: metrics}} />
                        </Col>
                    </Row>)}
        </div>
    );


}


export default App;