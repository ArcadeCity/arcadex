import { Layout } from 'antd';
import React from 'react';
const { Content } = Layout;

export default function BasicLayout({ children }) {
  return (
    <React.Fragment>
      <Layout
        style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}
      >
        <Content style={{ flex: 1 }}>{children}</Content>
      </Layout>
    </React.Fragment>
  );
}
