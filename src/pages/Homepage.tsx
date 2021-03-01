import React from 'react';
import { ArcadeUI } from '@arcadecity/ui';
import WalletConnect from '../components/WalletConnect';

const Homepage = () => {
  return (
    <ArcadeUI>
      <div style={{ margin: 80 }}>
        <h1 style={{ fontSize: 36 }}>Metamarket</h1>
        <p>
          <strong>Turn any image into an NFT and sell it for USDC.</strong>
        </p>
        <p>No middle-man, all decentralized.</p>
        <h5 style={space}>Step 1 - Connect a SOL wallet</h5>
        <WalletConnect />
        <h5 style={space}>Step 2 - Create your NFT</h5>
        <h5 style={space}>Step 3 - List it for sale</h5>
        <p>Quantity to list:</p>
        <p>Price:</p>
        <button>List it</button>
      </div>
    </ArcadeUI>
  );
};

export default Homepage;

const space = { marginTop: 55 };
