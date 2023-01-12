import './App.css';
import React, { useEffect, useState } from 'react';
import './index.css';
import { Divider, Row, Col } from "antd";
import moment from 'moment';

export enum RespType {
    Text,
    Json
}

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

    function TimeDiff(time: Time | undefined){
        if(time != undefined){
            var startDate = moment.unix(time.properties.epoch.type/1000).format("hh:mm:ss");
            var endDate = moment.unix(new Date().getTime()/1000).format("hh:mm:ss");

            const start = moment(startDate, 'hh:mm:ss');
            const end = moment(endDate, 'hh:mm:ss');

            return moment.utc(moment(end,"HH:mm:ss").diff(moment(start,"HH:mm:ss"))).format("HH:mm:ss");
        }

    }

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

    useEffect(() => {

        Fetch("http://localhost:4000/metrics", RespType.Text);
        Fetch("http://localhost:4000/time", RespType.Json);

        setInterval(() => Fetch("http://localhost:4000/metrics", RespType.Text), 10000)
        setInterval(() => Fetch("http://localhost:4000/time", RespType.Json), 10000)

        
        
    }, [])

    return (
        <div>
            {loading ?
                (<div>Loading...</div>) : (
                    <Row>
                        <Col span={11}>Fetched value for server time <br />
                        {time?.properties.epoch.description}  <br />
                        Time different between server and client: {TimeDiff(time)}  <br /></Col>
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