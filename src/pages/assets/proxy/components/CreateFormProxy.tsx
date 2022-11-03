import ProForm, {ModalForm, ProFormList, ProFormSelect, ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {Button, Space, Tooltip} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import React from "react";


type CreateFormType = {
  visible: boolean;
  onFinish: (value: API.ProxyPlatformItem) => Promise<void>;
  onVisibleChange: (visible: boolean) => void;
  onClick: () => void;
  value: {proxyPlatformSelect: []};
};

const CreateFormProxy: React.FC<CreateFormType> = (props) => {

  return (
    <ModalForm
        title="添加代理"
        width="400px"
        visible={props.visible}
        onVisibleChange={props.onVisibleChange}
        onFinish={props.onFinish}
      >
        <ProFormText
          label="IP"
          name="ip"
          width="md"
          rules={[{required: true}]}
        />
        <ProForm.Item
          noStyle
        >
          <Space>
            <ProFormSelect
              label="平台"
              name="platform"
              width="md"
              options={props.value.proxyPlatformSelect}
              rules={[{required: true}]}
            />
            <Tooltip title="添加" color="blue">
              <Button type="link" icon={<PlusOutlined/>} onClick={props.onClick}/>
            </Tooltip>
          </Space>
        </ProForm.Item>
        <ProFormList
          label="账号"
          name="account"
          creatorButtonProps={{
            style: {width: 328},
            position: 'bottom',
            creatorButtonText: '添加账号',
          }}
        >
          <Space>
            <ProFormText
              width={130}
              name="username"
              rules={[{required: true, message: '请输入账号'}]}
            />
            <ProFormText.Password
              width={150}
              name="password"
              rules={[{required: true, message: '请输入密码'}]}
            />
          </Space>
        </ProFormList>
        <ProFormTextArea
          label="描述"
          name="desc"
          width="md"
        />
      </ModalForm>
  );
};


export default CreateFormProxy;
