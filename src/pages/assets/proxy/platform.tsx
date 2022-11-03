import React, {useRef, useState} from "react";
import type {ProColumns} from '@ant-design/pro-table';
import ProTable, {ActionType} from '@ant-design/pro-table';
import {
  createProxyPlatform,
  deleteProxyPlatform,
  getAllProxyPlatform,
  updateProxyPlatform
} from "@/services/wops/assets";
import {Button, Col, FormInstance, message, Row, Space, Typography} from 'antd';
import UpdateFormProxyPlatform from "@/pages/assets/proxy/components/UpdateFormProxyPlatform";
import {FooterToolbar} from "@ant-design/pro-layout";
import {DownOutlined, PlusOutlined} from "@ant-design/icons";
import CreateFormProxyPlatform from "@/pages/assets/proxy/components/CreateFormProxyPlatform";
import moment from "moment";
import XLSX from "xlsx";


const {Text} = Typography;


const handleCreate = async (fields: API.ProxyPlatformItem) => {
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

const handleUpdate = async (fields: API.ProxyPlatformItem) => {
  const hide = message.loading('正在编辑');

  try {
    await updateProxyPlatform(fields.id as number, {data: fields});
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
    await deleteProxyPlatform({data: {ids: selectedRows.map(item => item.id)}});
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败, 请重试!');
    return false;
  }
};


const ProxyPlatformTableList: React.FC = () => {
  const formRef = useRef<FormInstance>();
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ProxyPlatformItem>();
  const [updateVisible, setUpdateVisible] = useState<boolean>(false);
  const [selectedRowsState, setSelectedRows] = useState<API.ProxyPlatformItem[]>([]);
  const [createVisible, setCreateVisible] = useState<boolean>(false);
  const [tableData, setTableData] = useState<API.ProxyPlatformItem[]>([]);


  const columns: ProColumns<API.ProxyPlatformItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      valueType: 'text',
      render: (text, row) => <a href={row.address as string} target="_blank">{text}</a>,
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
        return <Space  direction="vertical">{children}</Space>
      }
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
      render: (_, row) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(row);
            setUpdateVisible(true);
          }}
        >
          编辑
        </a>,
        <a key="delete" onClick={async () => {
          const success = await handleDelete([row]);

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
      <ProTable<API.ProxyPlatformItem, API.PageParams>
        columns={columns}
        request={getAllProxyPlatform}
        rowKey="id"
        formRef={formRef}
        actionRef={actionRef}
        postData={data => {
          setTableData(data);
          return data;
        }}
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
          <Button onClick={() => {
            const workbook = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(tableData);
            XLSX.utils.book_append_sheet(workbook, ws, "Sheet1");
            XLSX.writeFile(workbook, '代理平台.xlsb');
          }}>
            导出数据
            <DownOutlined/>
          </Button>
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
      {createVisible && <CreateFormProxyPlatform
        onFinish={async value => {
          const success = await handleCreate(value as API.ProxyPlatformItem);

          if (success) {
            setCreateVisible(false);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        visible={createVisible}
        onVisibleChange={setCreateVisible}
      />
      }
      {updateVisible && <UpdateFormProxyPlatform
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
    </>
  );
}


export default ProxyPlatformTableList;
