import React, { useState } from 'react';
import { Account } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { space } from '../pages/Homepage';
import { SkynetClient } from 'skynet-js';
import { useConnection } from '../utils/connection';
import { useWallet } from '../utils/wallet';
import { sleep } from '../utils/utils';
// import { listMarket } from '../utils/send';
// import { CustomMarketInfo, MarketInfo } from '../utils/types';
// import { getMarketInfos, useCustomMarkets, useMarket } from '../utils/markets';
// import { Event } from '@project-serum/serum/lib/queue';
// import { Order } from '@project-serum/serum/lib/market';
// import { SellNFT } from '../components/SellNFT';
// import { MarketProvider } from '../utils/markets';
// import UserInfoTable from '../components/UserInfoTable';
// import OrderbookComponent from '../components/Orderbook';

const client = new SkynetClient('https://siasky.net');
const key =
  process.env.NODE_ENV === 'production' ? undefined : require('./KEY').default;

export const CreateYourNFT = () => {
  const [name, setName] = useState<string>('');
  const [file, setFile] = useState<any>();
  const [imgPreview, setImgPreview] = useState<string>();

  const connection = useConnection();
  const { wallet } = useWallet();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    setFile(file);
    setImgPreview(url);
  };

  const onChangeName = (e) => {
    setName(e.target.value);
  };

  const submitNftForm = async (e) => {
    e.preventDefault();

    // First we mint a token
    const mintAccount = new Account(key);
    console.log(mintAccount.publicKey.toString());

    const token = await Token.createMint(
      connection,
      mintAccount,
      mintAccount.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID,
    );
    console.log('Created token', token);

    const newTokenMint = token.publicKey.toString();
    console.log(`Token public key: ${newTokenMint}`);

    await sleep(2000);

    console.log('CREATING ACCOUNT');
    let newAccount1 = await token.createAccount(wallet.publicKey);

    await sleep(2000);

    console.log('MINTING...');
    await token.mintTo(newAccount1, mintAccount, [], 1);

    console.log('MINTED.');
    await sleep(2000);

    try {
      // upload
      const { skylink } = await client.uploadFile(file);
      console.log(`Image upload successful, skylink: ${skylink}`);

      const metadata = {
        name,
        imageSkylink: skylink,
        owner: wallet.publicKey.toString(),
        timestamp: Date.now(),
        tokenPublicKey: token.publicKey.toString(),
      };

      //Convert JSON Array to string.
      var json = JSON.stringify(metadata);

      //Convert JSON string to BLOB.
      const jsonarray = [json];
      var blob1 = new Blob(jsonarray, { type: 'text/plain;charset=utf-8' });
      const jsonfile = new File([blob1], 'metadata.json');

      const { skylink: metadataSkylink } = await client.uploadFile(jsonfile);
      console.log(
        `Metadata file upload successful, skylink: ${metadataSkylink}`,
      );

      client.downloadFile(metadataSkylink);
      console.log('Downloaded metadata');
    } catch (error) {
      console.log(error);
    }
  };

  return (
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
  );
};
