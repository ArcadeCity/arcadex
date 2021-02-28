import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { useMarket } from '../utils/markets';

const ActionButton = styled(Button)`
  color: #2abdd2;
  background-color: #212734;
  border-width: 0px;
`;

export const SellNFT = () => {
  const { market } = useMarket();
  console.log('SellNFT market:', market);

  const doSellNFT = async () => {
    console.log('ok lets sell nft');
    if (!market) return;
    console.log('market now:', market);
    // const orderParams: OrderParams = {
    //   owner,
    // };
    // thisMarket.placeOrder(connection, orderParams);
  };

  return (
    <ActionButton size="large" onClick={doSellNFT} style={{ marginLeft: 20 }}>
      Sell NFT
    </ActionButton>
  );
};
