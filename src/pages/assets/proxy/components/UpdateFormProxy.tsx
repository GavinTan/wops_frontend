import React from "react";
import {ModalForm, ProFormList, ProFormSelect, ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {Space} from "antd";


type UpdateFormType = {
  visible: boolean;
  onFinish: (value: API.ProxyPlatformItem) => Promise<void>;
  onVisibleChange: (visible: boolean) => void;
  value: API.ProxyPlatformItem & {platformList?: []};
};


const UpdateFormProxy: React.FC<UpdateFormType> = (props) => {

  return (
    <ModalForm
      title="编辑"
      width={400}
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
        label="IP"
        name="ip"
        width="md"
        rules={[{required: true}]}
      />
      <ProFormSelect
        label="平台"
        name="platform"
        width="md"
        options={props.value.platformList}
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


export default UpdateFormProxy;
