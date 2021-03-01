import React, { useState } from 'react';
import { ArcadeUI } from '@arcadecity/ui';
import WalletConnect from '../components/WalletConnect';

const Homepage = () => {
  const [imgPreview, setImgPreview] = useState<string>();
  const handleFileChange = (event) => {
    const url = URL.createObjectURL(event.target.files[0]);
    setImgPreview(url);
  };

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

        <form>
          <h5 style={space}>Step 2 - Create your NFT</h5>
          <input style={{ width: 250 }} placeholder="Name it" />
          <input
            type="file"
            style={{ marginTop: 25, width: 250 }}
            onChange={handleFileChange}
          />
          <button type="submit" style={{ marginLeft: 15, marginTop: 25 }}>
            Create NFT
          </button>
          <div style={{ marginTop: 10 }}>
            <img src={imgPreview} style={{ border: 'none' }} />
          </div>
        </form>

        <h5 style={space}>Step 3 - List it for sale</h5>
        <input style={{ width: 150 }} placeholder="Quantity to list" />
        <input
          style={{ width: 150, marginTop: 20 }}
          placeholder="Price in USDC"
        />
        <button disabled style={{ marginTop: 25 }}>
          List it
        </button>
      </div>
    </ArcadeUI>
  );
};

export default Homepage;

const space = { marginTop: 75 };
