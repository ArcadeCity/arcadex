/* eslint-disable */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import {
  useSelectedBaseCurrencyBalances,
  useSelectedQuoteCurrencyBalances,
  useMarket,
  useMarkPrice,
  useSelectedOpenOrdersAccount,
  useSelectedBaseCurrencyAccount,
  useSelectedQuoteCurrencyAccount,
  useFeeDiscountKeys,
  useLocallyStoredFeeDiscountKey,
} from '../utils/markets';
import { useWallet } from '../utils/wallet';
// import { notify } from '../utils/notifications';
import {
  getDecimalCount,
  roundToDecimal,
  floorToDecimal,
} from '../utils/utils';
import { useSendConnection } from '../utils/connection';
import { getUnixTs, placeOrder } from '../utils/send';
// import { SwitchChangeEventHandler } from 'antd/es/switch';
// import { refreshCache } from '../utils/fetch-loop';
// import tuple from 'immutable-tuple';

const ActionButton = styled(Button)`
  color: #2abdd2;
  background-color: #212734;
  border-width: 0px;
`;

export const SellNFT = () => {
  const [side, setSide] = useState<'buy' | 'sell'>('sell');
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const baseCurrencyBalances = useSelectedBaseCurrencyBalances();
  const quoteCurrencyBalances = useSelectedQuoteCurrencyBalances();
  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();
  const openOrdersAccount = useSelectedOpenOrdersAccount(true);
  const { wallet, connected } = useWallet();
  const sendConnection = useSendConnection();
  const markPrice = useMarkPrice();
  useFeeDiscountKeys();
  const {
    storedFeeDiscountKey: feeDiscountKey,
  } = useLocallyStoredFeeDiscountKey();

  const [postOnly, setPostOnly] = useState(false);
  const [ioc, setIoc] = useState(false);
  const [baseSize, setBaseSize] = useState<number | undefined>(undefined);
  const [quoteSize, setQuoteSize] = useState<number | undefined>(undefined);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [sizeFraction, setSizeFraction] = useState(0);

  const availableQuote =
    openOrdersAccount && market
      ? market.quoteSplSizeToNumber(openOrdersAccount.quoteTokenFree)
      : 0;

  let quoteBalance = (quoteCurrencyBalances || 0) + (availableQuote || 0);
  let baseBalance = baseCurrencyBalances || 0;
  let sizeDecimalCount =
    market?.minOrderSize && getDecimalCount(market.minOrderSize);
  let priceDecimalCount = market?.tickSize && getDecimalCount(market.tickSize);

  // useEffect(() => {
  //   setChangeOrderRef && setChangeOrderRef(doChangeOrder);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [setChangeOrderRef]);

  useEffect(() => {
    baseSize && price && onSliderChange(sizeFraction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  useEffect(() => {
    updateSizeFraction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, baseSize]);

  useEffect(() => {
    const warmUpCache = async () => {
      try {
        if (!wallet || !wallet.publicKey || !market) {
          console.log(`Skipping refreshing accounts`);
          return;
        }
        const startTime = getUnixTs();
        console.log(`Refreshing accounts for ${market.address}`);
        await market?.findOpenOrdersAccountsForOwner(
          sendConnection,
          wallet.publicKey,
        );
        await market?.findBestFeeDiscountKey(sendConnection, wallet.publicKey);
        const endTime = getUnixTs();
        console.log(
          `Finished refreshing accounts for ${market.address} after ${
            endTime - startTime
          }`,
        );
      } catch (e) {
        console.log(`Encountered error when refreshing trading accounts: ${e}`);
      }
    };
    warmUpCache();
    const id = setInterval(warmUpCache, 30_000);
    return () => clearInterval(id);
  }, [market, sendConnection, wallet, wallet.publicKey]);

  const onSetBaseSize = (baseSize: number | undefined) => {
    setBaseSize(baseSize);
    if (!baseSize) {
      setQuoteSize(undefined);
      return;
    }
    let usePrice = price || markPrice;
    if (!usePrice) {
      setQuoteSize(undefined);
      return;
    }
    const rawQuoteSize = baseSize * usePrice;
    const quoteSize =
      baseSize && roundToDecimal(rawQuoteSize, sizeDecimalCount);
    setQuoteSize(quoteSize);
  };

  const onSetQuoteSize = (quoteSize: number | undefined) => {
    setQuoteSize(quoteSize);
    if (!quoteSize) {
      setBaseSize(undefined);
      return;
    }
    let usePrice = price || markPrice;
    if (!usePrice) {
      setBaseSize(undefined);
      return;
    }
    const rawBaseSize = quoteSize / usePrice;
    const baseSize = quoteSize && roundToDecimal(rawBaseSize, sizeDecimalCount);
    setBaseSize(baseSize);
  };

  // const doChangeOrder = ({
  //   size,
  //   price,
  // }: {
  //   size?: number;
  //   price?: number;
  // }) => {
  //   const formattedSize = size && roundToDecimal(size, sizeDecimalCount);
  //   const formattedPrice = price && roundToDecimal(price, priceDecimalCount);
  //   formattedSize && onSetBaseSize(formattedSize);
  //   formattedPrice && setPrice(formattedPrice);
  // };

  const updateSizeFraction = () => {
    const rawMaxSize =
      side === 'buy' ? quoteBalance / (price || markPrice || 1) : baseBalance;
    const maxSize = floorToDecimal(rawMaxSize, sizeDecimalCount);
    const sizeFraction = Math.min(((baseSize || 0) / maxSize) * 100, 100);
    setSizeFraction(sizeFraction);
  };

  const onSliderChange = (value) => {
    if (!price && markPrice) {
      let formattedMarkPrice: number | string = priceDecimalCount
        ? markPrice.toFixed(priceDecimalCount)
        : markPrice;
      setPrice(
        typeof formattedMarkPrice === 'number'
          ? formattedMarkPrice
          : parseFloat(formattedMarkPrice),
      );
    }

    let newSize;
    if (side === 'buy') {
      if (price || markPrice) {
        newSize = ((quoteBalance / (price || markPrice || 1)) * value) / 100;
      }
    } else {
      newSize = (baseBalance * value) / 100;
    }

    // round down to minOrderSize increment
    let formatted = floorToDecimal(newSize, sizeDecimalCount);

    onSetBaseSize(formatted);
  };

  // const postOnChange: SwitchChangeEventHandler = (checked) => {
  //   if (checked) {
  //     setIoc(false);
  //   }
  //   setPostOnly(checked);
  // };
  // const iocOnChange: SwitchChangeEventHandler = (checked) => {
  //   if (checked) {
  //     setPostOnly(false);
  //   }
  //   setIoc(checked);
  // };

  // async function onSubmit() {
  //   if (!price) {
  //     console.warn('Missing price');
  //     notify({
  //       message: 'Missing price',
  //       type: 'error',
  //     });
  //     return;
  //   } else if (!baseSize) {
  //     console.warn('Missing size');
  //     notify({
  //       message: 'Missing size',
  //       type: 'error',
  //     });
  //     return;
  //   }

  //   setSubmitting(true);
  //   try {
  //     await placeOrder({
  //       side,
  //       price,
  //       size: baseSize,
  //       orderType: ioc ? 'ioc' : postOnly ? 'postOnly' : 'limit',
  //       market,
  //       connection: sendConnection,
  //       wallet,
  //       baseCurrencyAccount: baseCurrencyAccount?.pubkey,
  //       quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
  //       feeDiscountPubkey: feeDiscountKey,
  //     });
  //     refreshCache(tuple('getTokenAccounts', wallet, connected));
  //     setPrice(undefined);
  //     onSetBaseSize(undefined);
  //   } catch (e) {
  //     console.warn(e);
  //     notify({
  //       message: 'Error placing order',
  //       description: e.message,
  //       type: 'error',
  //     });
  //   } finally {
  //     setSubmitting(false);
  //   }
  // }

  const doBuyNFT = async () => {
    if (!market) return;
    const theorder: any = {
      side: 'buy',
      price: price ?? 5,
      size: baseSize ?? 1,
      orderType: ioc ? 'ioc' : postOnly ? 'postOnly' : 'limit',
      market,
      connection: sendConnection,
      wallet,
      baseCurrencyAccount: baseCurrencyAccount?.pubkey,
      quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
      feeDiscountPubkey: undefined, // feeDiscountKey,
    };
    console.log('Placing order to buy NFT...', theorder);
    try {
      await placeOrder(theorder);
    } catch (e) {
      console.log('Error:', e);
    }
  };

  const doSellNFT = async () => {
    if (!market) return;
    const theorder: any = {
      side: 'sell',
      price: price ?? 5,
      size: baseSize ?? 1,
      orderType: ioc ? 'ioc' : postOnly ? 'postOnly' : 'limit',
      market,
      connection: sendConnection,
      wallet,
      baseCurrencyAccount: baseCurrencyAccount?.pubkey,
      quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
      feeDiscountPubkey: undefined, // feeDiscountKey,
    };
    console.log('Placing order to sell NFT...', theorder);
    try {
      await placeOrder(theorder);
    } catch (e) {
      console.log('Error:', e);
    }
  };

  return (
    <>
      <ActionButton size="large" onClick={doBuyNFT} style={{ marginLeft: 20 }}>
        Buy NFT for 5 USDC
      </ActionButton>
      <ActionButton size="large" onClick={doSellNFT} style={{ marginLeft: 20 }}>
        Sell NFT for 5 USDC
      </ActionButton>
    </>
  );
};
