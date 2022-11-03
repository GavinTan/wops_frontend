import React from 'react';
import {
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
} from '@ant-design/pro-form';


type UpdateFormType = {
  visible: boolean;
  onFinish: (value: API.AssetItem) => Promise<void>;
  onVisibleChange: (visible: boolean) => void;
  value: API.AssetItem & { proxySelect?: [], treeList?: [] };
};

const UpdateFormAsset: React.FC<UpdateFormType> = (props) => {
  return (
    <ModalForm
      title="编辑"
      width="400px"
      visible={props.visible}
      onVisibleChange={props.onVisibleChange}
      onFinish={props.onFinish}
      initialValues={props.value}
    >
      <ProFormText
        label="ID"
        name="id"
        width="md"
        hidden
      />
      <ProFormText
        rules={[{required: true}]}
        width="md"
        name="name"
        label="名称"
      />
      <ProFormText
        width="md"
        name="ip"
        label="IP"
      />
      <ProFormSelect
        name="proxy"
        label="代理"
        width="md"
        options={props.value.proxySelect}
      />
      <ProFormSelect
        width="md"
        name="tree_node"
        label="节点"
        options={props.value.treeList}
      />
      <ProFormTextArea label="描述" width="md" name="desc"/>
    </ModalForm>
  );
};

export default UpdateFormAsset;
