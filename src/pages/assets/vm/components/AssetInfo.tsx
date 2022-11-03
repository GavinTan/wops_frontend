import React from "react";
import {Modal, Tabs} from "antd";
import ProDescriptions from '@ant-design/pro-descriptions';

const { TabPane } = Tabs;

type modalType = {
  visible: boolean;
  onCancel: () => void;
  currentRow: API.AssetItem;
};

const AssetInfoModal: React.FC<modalType> = (props) => {

  return (
    <Modal
      footer={null}
      visible={props.visible}
      onCancel={() => props.onCancel()}
    >
      <Tabs type="card">
        <TabPane tab="信息" key="info">
          <ProDescriptions
            bordered
            size="small"
            column={1}
            request={async () => ({data: props.currentRow})}
            columns={[
              {title: '名称', valueType: 'text', dataIndex: 'name'},
              {title: 'IP', valueType: 'text', dataIndex: 'ip'},
              {title: '代理', valueType: 'text', dataIndex: 'proxy', render: (text) => <a>{text.ip}</a>},
              {title: '描述', valueType: 'textarea', dataIndex: 'desc'},
              {title: '创建时间', valueType: 'dateTime', dataIndex: 'create_time'},
            ]}
          />
        </TabPane>
    <TabPane tab="Tab 2" key="2">
      Content of Tab Pane 2
    </TabPane>
    <TabPane tab="Tab 3" key="3">
      Content of Tab Pane 3
    </TabPane>
      </Tabs>
    </Modal>
  )
};



export default AssetInfoModal;
