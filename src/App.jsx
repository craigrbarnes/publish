import React from 'react';
import './App.css';
import Publish from './components/Publish'
import {PageHeader} from "antd";
import 'antd/dist/antd.css';

function App() {
    return (
        <div className="App">
            <div className="site-page-header-ghost-wrapper">
                <PageHeader className="site-page-header"
                            title="Publish Demo"
                            ghost={true}
                            extra={[
                                <img
                                    src="https://brh.data-commons.org/src/img/gen3.png"
                                    alt="gen3 Logo"
                                    height="64px"
                                />
                            ]}
                />
            </div>
            <div className="publish-container">
                <Publish>

                </Publish>
            </div>
        </div>
    );
}

export default App;
