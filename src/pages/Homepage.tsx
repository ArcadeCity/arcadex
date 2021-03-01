import React, { useState } from 'react';
import { ArcadeUI } from '@arcadecity/ui';
import WalletConnect from '../components/WalletConnect';

const Homepage = () => {
  const [name, setName] = useState<string>('');
  const [imgPreview, setImgPreview] = useState<string>();
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    setImgPreview(url);
  };

  const onChangeName = (e) => {
    setName(e.target.value);
  };

  const submitNftForm = (e) => {
    e.preventDefault();
    console.log('welcome', name, imgPreview);
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

        <form onSubmit={submitNftForm}>
          <h5 style={space}>Step 2 - Create your NFT</h5>
          <input
            type="text"
            style={{ width: 250 }}
            placeholder="Name it"
            value={name}
            onChange={onChangeName}
          />
          <input
            type="file"
            style={{ marginTop: 25, width: 250 }}
            onChange={handleFileChange}
          />
          <button type="submit" style={{ marginLeft: 15, marginTop: 25 }}>
            Create NFT
          </button>
          <div style={{ marginTop: 10 }}>
            {imgPreview && (
              <img alt="Preview" src={imgPreview} style={{ border: 'none' }} />
            )}
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
