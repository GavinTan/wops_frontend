import React from 'react';
import ProForm, {
  ProFormSelect,
  ProFormText,
  ModalForm,
} from '@ant-design/pro-form';

export type FormValueType = {
} & Partial<API.ServerItem>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  handleUpdateModalVisible: (visible: boolean) => void;
  values: Partial<API.ServerItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const [form] = ProForm.useForm();
  const connTypeList = [
    {label: 'tcp', value: 1},
    {label: 'ssh', value: 2},
    {label: 'tls', value: 3},
  ];

  return (
    <ModalForm
      title="更新服务器"
      width="512px"
      form={form}
      visible={props.updateModalVisible}
      onVisibleChange={props.handleUpdateModalVisible}
      onFinish={props.onSubmit}
      initialValues={props.values}
    >
      <ProFormText
          width="xs"
          name="id"
          label="ID"
          hidden
        />
        <ProForm.Group>
        <ProFormText
          width="sm"
          name="name"
          label="名称"
        />
        <ProFormText
          rules={[{required: true}]}
          width="sm"
          name="host"
          label={"IP"}
        />
        </ProForm.Group>
        <ProForm.Group>
        <ProFormText
          width="sm"
          name="username"
          label="用户名"
        />
        <ProFormText.Password
          width="sm"
          name="password"
          label={"密码"}
        />
        </ProForm.Group>
        <ProForm.Group>
        <ProFormSelect
          label="连接类型"
          width="sm"
          name="conn_type"
          options={connTypeList}
          fieldProps={{
            onChange: value => {
              if (value === 1) {
                form.setFieldsValue({conn_port: 16509});
              }
              if (value === 2) {
                form.setFieldsValue({conn_port: 22});
              }
              if (value === 3) {
                form.setFieldsValue({conn_port: 16514});
              }
            }
          }}
        />
        <ProFormText
          label="连接端口"
          name="conn_port"
          width="sm"
        />
        </ProForm.Group>
      </ModalForm>
  );
};

export default UpdateForm;
