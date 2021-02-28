import React from 'react';
import styled from 'styled-components';
import { Button, Tabs } from 'antd';
import { Account } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import FloatingElement from '../components/layout/FloatingElement';
import { useConnection } from '../utils/connection';
import { useWallet } from '../utils/wallet';
import { sleep } from '../utils/utils';

const key =
  process.env.NODE_ENV === 'production' ? undefined : require('./KEY').default;

const { TabPane } = Tabs;

const ActionButton = styled(Button)`
  color: #2abdd2;
  background-color: #212734;
  border-width: 0px;
`;

export default function MinterPage() {
  const connection = useConnection();
  const { wallet } = useWallet();

  const mintNFT = async () => {
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

    sleep(1000);

    console.log('CREATING ACCOUNT');
    let newAccount1 = await token.createAccount(wallet.publicKey);

    sleep(1000);

    console.log('MINTING...');
    await token.mintTo(newAccount1, mintAccount, [], 1);
    console.log('MINTED');
  };

  return (
    <FloatingElement style={{ flex: 1, paddingTop: 10, margin: 60 }}>
      <Tabs defaultActiveKey="createNFT">
        <TabPane tab="Create your NFT" key="createNFT">
          <p>Let's create your first NFT.</p>
          <ActionButton size="large" onClick={mintNFT}>
            Create NFT
          </ActionButton>
        </TabPane>
      </Tabs>
    </FloatingElement>
  );
}
