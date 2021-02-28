import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Tabs } from 'antd';
import { notify } from '../utils/notifications';
import { Account, PublicKey } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { MARKETS, Orderbook } from '@project-serum/serum';
import FloatingElement from '../components/layout/FloatingElement';
import { useConnection } from '../utils/connection';
import { useWallet } from '../utils/wallet';
import { sleep } from '../utils/utils';
import { listMarket } from '../utils/send';
import { CustomMarketInfo, MarketInfo } from '../utils/types';
import { getMarketInfos, useCustomMarkets, useMarket } from '../utils/markets';
import { Event } from '@project-serum/serum/lib/queue';
import { Order } from '@project-serum/serum/lib/market';
import { SellNFT } from '../components/SellNFT';
import { MarketProvider } from '../utils/markets';
import UserInfoTable from '../components/UserInfoTable';
import OrderbookComponent from '../components/Orderbook';

const key =
  process.env.NODE_ENV === 'production' ? undefined : require('./KEY').default;

const { TabPane } = Tabs;

const ActionButton = styled(Button)`
  color: #2abdd2;
  background-color: #212734;
  border-width: 0px;
`;

export default function MinterPage() {
  const [marketAddress, setMarketAddress] = useState();
  return (
    <MarketProvider
      marketAddress={marketAddress}
      setMarketAddress={setMarketAddress}
    >
      <MinterPageInternal />
    </MarketProvider>
  );
}

function MinterPageInternal() {
  const connection = useConnection();
  const { wallet } = useWallet();
  const { market, setMarketAddress } = useMarket();
  const { customMarkets, setCustomMarkets } = useCustomMarkets();
  const [ownerOrders, setOwnerOrders] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Orderbook>();
  console.log(ownerOrders, asks);

  const onPrice = () => {};
  const onSize = () => {};

  useEffect(() => {
    console.log('minter page sees customMarkets', customMarkets);
  }, [customMarkets]);

  const onAddCustomMarket = (customMarket) => {
    const marketInfo = getMarketInfos(customMarkets).some(
      (m) => m.address.toBase58() === customMarket.address,
    );
    if (marketInfo) {
      notify({
        message: `A market with the given ID already exists`,
        type: 'error',
      });
      return;
    }
    const newCustomMarkets = [...customMarkets, customMarket];
    console.log('setting newCustomMarkets', newCustomMarkets);
    setCustomMarkets(newCustomMarkets);
    setMarketAddress(customMarket.address);
  };

  const loadData = useCallback(async () => {
    console.log('market is:', market);
    if (!market) return;
    console.log('Loading market data...');

    const asks: Orderbook = await market.loadAsks(connection);
    console.log('Asks:', asks);
    setAsks(asks);

    const bids: Orderbook = await market.loadBids(connection);
    console.log('Bids:', bids);

    const events: Event[] = await market.loadEventQueue(connection);
    console.log('Events:', events);

    const fills: any[] = await market.loadFills(connection);
    console.log('Fills:', fills);

    const ownerOrders: Order[] =
      wallet.publicKey &&
      (await market.loadOrdersForOwner(connection, wallet.publicKey));
    console.log('Owner orders:', ownerOrders);
    setOwnerOrders(ownerOrders);

    const requests: any[] = await market.loadRequestQueue(connection);
    console.log('Requests:', requests);

    // setMarketAddress('3GhEPcAb17nDxuYVSdRaT2JbBNHmSioqPoStPbpZvnyj');
  }, [connection, market, wallet.publicKey]);

  useEffect(() => {
    loadData();
  }, [loadData, market]);

  const doViewMarket = async () => {
    const marketInfo: MarketInfo = {
      address: new PublicKey('3GhEPcAb17nDxuYVSdRaT2JbBNHmSioqPoStPbpZvnyj'),
      name: 'AAAA/USDC',
      programId: new PublicKey('EUqojwWA2rd19FZrzeBncJsm38Jm1hEhE3zsmX3bRc2o'),
      deprecated: false,
    };

    const customMarketInfo: CustomMarketInfo = {
      address: marketInfo.address.toString(),
      name: 'AAAA/USDC',
      programId: marketInfo.programId.toString(),
    };

    onAddCustomMarket(customMarketInfo);

    // setCustomMarkets([customMarketInfo]);

    // Market.load(connection, marketInfo.address, {}, marketInfo.programId)
    //   .then((market: Market) => {
    //     console.log('Loaded market:', market);
    //     setThisMarket(market);
    //     // console.log('setCustomMarkets successful');
    //   })
    //   .catch((e) =>
    //     notify({
    //       message: 'Error loading market',
    //       description: e.message,
    //       type: 'error',
    //     }),
    //   );
  };

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
          <ActionButton
            size="large"
            onClick={doViewMarket}
            style={{ marginLeft: 20 }}
          >
            Add custom market
          </ActionButton>
          <ActionButton
            size="large"
            onClick={loadData}
            style={{ marginLeft: 20 }}
          >
            Load market data
          </ActionButton>
          <ActionButton
            size="large"
            onClick={() =>
              setMarketAddress('3GhEPcAb17nDxuYVSdRaT2JbBNHmSioqPoStPbpZvnyj')
            }
            style={{ marginLeft: 20 }}
          >
            Set current market
          </ActionButton>
          {market && <SellNFT />}
          {/* <p style={{ marginTop: 20 }}>OPEN SALES</p>
          {asks && JSON.stringify(asks)} */}

          {/* <p style={{ marginTop: 20 }}>YOUR ORDERS</p>
          {ownerOrders &&
            ownerOrders.map((order) => (
              <div key={order.orderId.toString()}>
                <a
                  href={`https://explorer.solana.com/address/${order.openOrdersAddress.toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`Found an order to ${order.side} ${order.size} NFT for ${order.price} USDC.`}
                </a>
              </div>
            ))} */}

          <OrderbookComponent
            smallScreen={false}
            onPrice={onPrice}
            onSize={onSize}
          />

          <UserInfoTable />
        </TabPane>
      </Tabs>
    </FloatingElement>
  );
}
