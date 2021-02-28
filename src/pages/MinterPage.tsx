import React from 'react';
import styled from 'styled-components';
import { Button, Tabs } from 'antd';
import { notify } from '../utils/notifications';
import { Account, PublicKey } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { MARKETS } from '@project-serum/serum';
import FloatingElement from '../components/layout/FloatingElement';
import { useConnection } from '../utils/connection';
import { useWallet } from '../utils/wallet';
import { sleep } from '../utils/utils';
import { listMarket } from '../utils/send';

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

  const doListMarket = async () => {
    // @ts-ignore
    const dexProgramId = MARKETS.find(({ deprecated }) => !deprecated)
      .programId;
    const marketAddress = await listMarket({
      connection,
      wallet,
      baseMint: new PublicKey('KFFXVQjDiWJBd2kcyBSEZLLDEQLtkSex3p1Za9Pu3Jo'),
      quoteMint: new PublicKey(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      ),
      baseLotSize: 1, // baseLotSize,
      quoteLotSize: 1, // quoteLotSize,
      dexProgramId,
    });
    console.log('LISTED - MARKET ADDRESS:', marketAddress.toString());
  };

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

    await sleep(2000);

    console.log('CREATING ACCOUNT');
    let newAccount1 = await token.createAccount(wallet.publicKey);

    await sleep(2000);

    console.log('MINTING...');
    await token.mintTo(newAccount1, mintAccount, [], 1);

    console.log('MINTED. LISTING MARKET...');
    await sleep(2000);

    // @ts-ignore
    const dexProgramId = MARKETS.find(({ deprecated }) => !deprecated)
      .programId;
    console.log('dexProgramId', dexProgramId);
    await sleep(2000);
    try {
      console.log('trying . . . ');
      const marketAddress = await listMarket({
        connection,
        wallet,
        baseMint: token.publicKey,
        quoteMint: new PublicKey(
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        ),
        baseLotSize: 1, // baseLotSize,
        quoteLotSize: 1, // quoteLotSize,
        dexProgramId,
      });
      console.log('LISTED - MARKET ADDRESS:', marketAddress.toString());
    } catch (e) {
      console.warn(e);
      notify({
        message: 'Error listing new market',
        description: e.message,
        type: 'error',
      });
    }
  };

  return (
    <FloatingElement style={{ flex: 1, paddingTop: 10, margin: 60 }}>
      <Tabs defaultActiveKey="createNFT">
        <TabPane tab="Create your NFT" key="createNFT">
          <p>Let's create your first NFT.</p>
          <ActionButton size="large" onClick={mintNFT}>
            Create NFT
          </ActionButton>
          <ActionButton
            size="large"
            onClick={doListMarket}
            style={{ marginLeft: 20 }}
          >
            List market
          </ActionButton>
        </TabPane>
      </Tabs>
    </FloatingElement>
  );
}
