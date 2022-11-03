import React from "react";
import {ModalForm, ProFormList, ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {Space} from "antd";


type CreateFormType = {
  visible: boolean;
  onFinish: (value: API.ProxyPlatformItem) => Promise<void>;
  onVisibleChange: (visible: boolean) => void;
};


const CreateFormProxyPlatform: React.FC<CreateFormType> = (props) => {
  return (
    <ModalForm
      title="添加代理平台"
      width={400}
      visible={props.visible}
      onVisibleChange={props.onVisibleChange}
      onFinish={props.onFinish}
    >
      <ProFormText
        label="名称"
        name="name"
        width="md"
        rules={[{required: true}]}
      />
      <ProFormText
        label="地址"
        name="address"
        width="md"
      />
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


export default CreateFormProxyPlatform;
