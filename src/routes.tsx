import { HashRouter, Route, Switch } from 'react-router-dom';
import TradePage from './pages/TradePage';
import OpenOrdersPage from './pages/OpenOrdersPage';
import Homepage from './pages/Homepage';
import React from 'react';
import BalancesPage from './pages/BalancesPage';
import ConvertPage from './pages/ConvertPage';
import BasicLayout from './components/BasicLayout';
import ListNewMarketPage from './pages/ListNewMarketPage';
import NewPoolPage from './pages/pools/NewPoolPage';
import PoolPage from './pages/pools/PoolPage';
import PoolListPage from './pages/pools/PoolListPage';
import MinterPage from './pages/MinterPage';

export function Routes() {
  return (
    <>
      <HashRouter basename={'/'}>
        <BasicLayout>
          <Switch>
            <Route exact path="/" component={Homepage} />
            <Route exact path="/market/:marketAddress">
              <TradePage />
            </Route>
            <Route exact path="/create" component={MinterPage} />
            <Route exact path="/orders" component={OpenOrdersPage} />
            <Route exact path="/balances" component={BalancesPage} />
            <Route exact path="/convert" component={ConvertPage} />
            <Route
              exact
              path="/list-new-market"
              component={ListNewMarketPage}
            />
            <Route exact path="/pools">
              <PoolListPage />
            </Route>
            <Route exact path="/pools/new">
              <NewPoolPage />
            </Route>
            <Route exact path="/pools/:poolAddress">
              <PoolPage />
            </Route>
          </Switch>
        </BasicLayout>
      </HashRouter>
    </>
  );
}
