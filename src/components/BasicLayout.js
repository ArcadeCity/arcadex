import { Layout } from 'antd';
import React from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from './TopBar';
const { Header, Content } = Layout;

export default function BasicLayout({ children }) {
  const location = useLocation();
  return (
    <React.Fragment>
      <Layout
        style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}
      >
        {location.pathname !== '/' && (
          <Header style={{ padding: 0, minHeight: 64, height: 'unset' }}>
            <TopBar />
          </Header>
        )}

        <Content style={{ flex: 1 }}>{children}</Content>
      </Layout>
    </React.Fragment>
  );
}
