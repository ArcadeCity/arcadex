import React from 'react';
import { Tabs } from 'antd';
import FloatingElement from '../components/layout/FloatingElement';

const { TabPane } = Tabs;

export default function MinterPage() {
  return (
    <FloatingElement style={{ flex: 1, paddingTop: 10, margin: 60 }}>
      <Tabs defaultActiveKey="createNFT">
        <TabPane tab="Create your NFT" key="createNFT">
          <p>Let's create your first NFT.</p>
        </TabPane>
      </Tabs>
    </FloatingElement>
  );
}
