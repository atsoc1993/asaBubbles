import React, { useState } from 'react';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import axios from 'axios';
import './App.css';

function App() {
    const [data, setData] = useState(null);
    const [tokenId, setTokenId] = useState('');
    const [tokenName, setTokenName] = useState('');
    const [totalHolders, setTotalHolders] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = () => {
        if (!tokenId) return;
        setIsLoading(true);
        axios.get(`https://asa-bubbles.vercel.app/api/holdings?token_id=${tokenId}`)
            .then(response => {
                setData(response.data);
                console.log(response.data);
                setTokenName(response.data.tokenName);
                setTotalHolders(response.data.totalHolders);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
                setData(null);
                setTokenName('');
                setTotalHolders(0);
                setIsLoading(false);
            });
    };

    function customTooltip(node) {
      if (node.depth === 0) {
   
          return null; 
      }
  
      return (
          <div style={{
              color: 'black',
              background: 'white',
              padding: '12px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
          }}>
              <strong>{node.data.name}</strong>: {`${node.data.value.toLocaleString()} Tokens`}
          </div>
      );
  }
  

    return (
        <div className="App">
            <h1 style={{ color: 'white' }}>Bubble my ASA</h1>
            <div className="input-container">
                <input
                    type="text"
                    value={tokenId}
                    onChange={e => setTokenId(e.target.value)}
                    placeholder="Enter Token ID"
                    className="token-input"
                    style={{ color: 'white' }} // Ensure input text is white
                />
                <button onClick={fetchData} className="fetch-button">Fetch Data</button>
            </div>
            {tokenName && <h2 style={{ color: 'white' }}>{tokenName}</h2>}
            {totalHolders > 0 && <h3 style={{ color: 'white' }}>Total Holders: {totalHolders}</h3>}
            {isLoading ? (
                <p style={{ color: 'white' }}>Loading data...</p>
            ) : data ? (
                <>
                    <p style={{ color: 'white' }}>Please allow at least up to 10 seconds for bubble map generation.</p>
                    <div style={{ height: '700px' }}>
                    <ResponsiveCirclePacking
                      data={data}
                      id="name"
                      value="value"
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      colors={{ scheme: 'set2' }}
                      childColor={{ from: 'color', modifiers: [['brighter', 0.4]] }}
                      padding={3}
                      enableLabels={true}
                      labelsFilter={label => label.node.depth > 1}
                      labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                      borderColor={{ from: 'color', modifiers: [['darker', 0.5]] }}
                      tooltip={customTooltip}
                  />

                    </div>
                </>
            ) : (
                <p style={{ color: 'white' }}>Enter a token ID and click "Fetch Data" to see the results.</p>
            )}
        </div>
    );
}

export default App;
