import React, {useEffect, useRef, useState} from "react";
import type {ActionType, ProColumns} from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import type {FormInstance} from "antd";
import {Button, Col, message, Row, Space, Typography} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {
  getAllProxy,
  createProxy,
  createProxyPlatform,
  getAllProxyPlatform,
  updateProxy, deleteProxy
} from "@/services/wops/assets";
import CreateFormProxyPlatform from "@/pages/assets/proxy/components/CreateFormProxyPlatform";
import UpdateFormProxy from "@/pages/assets/proxy/components/UpdateFormProxy";
import {FooterToolbar} from "@ant-design/pro-layout";
import moment from "moment";
import CreateFormProxy from "@/pages/assets/proxy/components/CreateFormProxy";


const {Text} = Typography;


const handleCreate = async (fields: API.ProxyItem) => {
  const hide = message.loading('正在添加');

  try {
    await createProxy({data: fields});
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败, 请重试!');
    return false;
  }
};

const handleUpdate = async (fields: API.ProxyPlatformItem) => {
  const hide = message.loading('正在编辑');

  try {
    await updateProxy(fields.id as number, {data: fields});
    hide();
    message.success('编辑成功');
    return true;
  } catch (error) {
    hide();
    message.error('编辑失败, 请重试!');
    return false;
  }
};

const handleDelete = async (selectedRows: API.ProxyPlatformItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await deleteProxy({data: {ids: selectedRows.map(item => item.id)}});
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败, 请重试!');
    return false;
  }
};

const handleCreatePlatform = async (fields: API.ProxyPlatformItem) => {
  const hide = message.loading('正在添加');

  try {
    await createProxyPlatform({data: fields});
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败, 请重试!');
    return false;
  }
};


const ProxyTableList: React.FC = () => {
  const formRef = useRef<FormInstance>();
  const actionRef = useRef<ActionType>();
  const [createVisible, setCreateVisible] = useState<boolean>(false);
  const [createProxyPlatformVisible, setCreateProxyPlatformVisible] = useState<boolean>(false);
  const [proxyPlatformSelect, setProxyPlatformSelect] = useState<any>([]);
  const [updateVisible, setUpdateVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.ProxyPlatformItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.ProxyPlatformItem[]>([]);

  useEffect(() => {
    getAllProxyPlatform().then(res => {
      setProxyPlatformSelect(res.data?.map(item => ({label: item.name, value: item.id})))
    })
  }, [])


  const columns: ProColumns<API.ProxyItem>[] = [
    {
      title: 'IP',
      dataIndex: 'ip',
      valueType: 'text',
      fieldProps: {
        onChange: (e: any) => {
          if (e.target.value === '') {
            if (formRef.current) {
              formRef.current.submit();
            }
          }
        },
      },
    },
    {
      title: '账号',
      dataIndex: 'account',
      valueType: 'text',
      render: (text: any) => {
        let children;
        if (text instanceof Array) {
          children = text.map(item => <Row key={item.username}><Col span={24}><Text>账号: </Text><Text
            copyable>{item.username}</Text></Col><Col span={24}><Text>密码: </Text><Text
            copyable>{item.password}</Text></Col></Row>)
        } else {
          children = text;
        }
        return <Space direction="vertical">{children}</Space>
      }
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      valueType: 'text',
      hideInSearch: true
    },
    {
      title: '平台',
      dataIndex: 'platform',
      valueType: 'text',
      hideInTable: true,
      valueEnum: () => {
        const value = {};
        proxyPlatformSelect.forEach((item: {label: string; value: number;}) => {
          value[item.label] = {text: item.label}
        })
        return value
      },
      fieldProps: {
        onChange: () => {
          formRef.current?.submit();
        },
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      valueType: 'textarea',
      hideInSearch: true
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      sorter: (a, b) => moment(a.create_time).unix() - moment(b.create_time).unix()
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (text, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(Object.assign(record, {platform: record.platform?.id, platformList: proxyPlatformSelect}));
            setUpdateVisible(true);
          }}
        >
          编辑
        </a>,
        <a key="delete" onClick={async () => {
          const success = await handleDelete([record]);

          if (success) {
            actionRef.current?.reload();
          }
        }}>
          删除
        </a>,
      ],
    },
  ]

  return (
    <>
      <ProTable<API.ProxyItem, API.PageParams>
        rowKey="id"
        columns={columns}
        request={getAllProxy}
        formRef={formRef}
        actionRef={actionRef}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCreateVisible(true);
            }}
          >
            <PlusOutlined/> 新建
          </Button>,
        ]}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleDelete(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      {createVisible && <CreateFormProxy
        visible={createVisible}
        onVisibleChange={setCreateVisible}
        onFinish={async value => {
          const success = await handleCreate(value as API.ProxyItem);

          if (success) {
            setCreateVisible(false);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onClick={() => setCreateProxyPlatformVisible(true)}
        value={{proxyPlatformSelect}}
      />
      }
      {updateVisible && <UpdateFormProxy
        visible={updateVisible}
        onFinish={async value => {
          const success = await handleUpdate(value);

          if (success) {
            setUpdateVisible(false);
            setCurrentRow(undefined);
            actionRef.current?.reload();
          }
        }}
        onVisibleChange={setUpdateVisible}
        value={currentRow || {}}/>
      }
      {createProxyPlatformVisible && <CreateFormProxyPlatform
        onFinish={async value => {
          const success = await handleCreatePlatform(value as API.ProxyPlatformItem);

          if (success) {
            setCreateProxyPlatformVisible(false);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        visible={createProxyPlatformVisible}
        onVisibleChange={setCreateProxyPlatformVisible}
      />
      }
    </>
  );
};


export default ProxyTableList;
