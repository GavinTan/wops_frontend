import { PlusOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, message, Progress, Drawer, FormInstance, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { getAllServer, createServer, updateServer, deleteServer, multipleDeleteServer } from '@/services/wops/kvm';
import moment from 'moment';
import './index.less';


const handleCreate = async (data: API.ServerItem) => {
  const hide = message.loading('正在添加');

  try {
    await createServer({ data });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};


const handleUpdate = async (data: API.ServerItem) => {
  const hide = message.loading('正在修改');

  try {
    await updateServer(data.id as number, {data});
    hide();
    message.success('修改成功');
    return true;
  } catch (error) {
    hide();
    message.error('修改失败请重试！');
    return false;
  }
};

const handleDelete = async (data: API.ServerItem) => {
  const hide = message.loading('正在删除');
  if (!data) return true;

  try {
    await deleteServer(data.id as number);
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};


const handleMultipleDelete = async (data: API.ServerItem[]) => {
  const hide = message.loading('正在删除');
  if (!data) return true;

  try {
    await multipleDeleteServer({
      data: {
        ids: data.map((row) => row.id),
      }
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};


const TableNodeList: React.FC = () => {
  const [createModalVisible, handleCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const [polling] = useState<number | undefined>(1000 * 30);
  const [currentRow, setCurrentRow] = useState<API.ServerItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.ServerItem[]>([]);

  const columns: ProColumns<API.ServerItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
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
      title: 'IP',
      dataIndex: 'host',
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
      title: 'CPU',
      dataIndex: 'cpu',
      search: false,
      sorter: (a, b) => a.cpu! - b.cpu!
    },
    {
      title: '内存',
      dataIndex: 'memory',
      search: false,
      sorter: (a, b) => Number(a.memory?.replace(/\D/g,'')) - Number(b.memory?.replace(/\D/g,''))
    },
    {
      title: '内存使用率',
      dataIndex: 'memory_usage',
      search: false,
      render: (dom: any) => {
        return <Progress
          className="red-text"
          type="circle"
          percent={dom}
          width={40}
          format={(percent) => {
            return `${percent}%`
          }}
          strokeColor={ dom >= 80 ? '#ff4d4f' : '#1890ff'}
        />
      },
      sorter: (a, b) => b.memory_usage! - a.memory_usage!

    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        'false': {
          text: '断开',
          status: 'Default',
        },
        'true': {
          text: '连接',
          status: 'Processing',
        },
      },
    },
    {
      title: '创建日期',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      sorter: (a, b) => moment(a.create_time).unix() - moment(b.create_time).unix()
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record: any) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalVisible(true);
            setCurrentRow(record);
          }}
        >
          编辑
        </a>,
        <a key="deleteServer" onClick={async () => {
          Modal.confirm({
            title: `确认删除 ${record.host} 吗?`,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
              handleDelete(record);
              actionRef.current?.reloadAndRest?.();
              },
            onCancel() {
              },
          });


        }}>
          删除
        </a>,
      ],
    },
  ];
  return (
    <PageContainer>
      <ProTable<API.ServerItem, API.PageParams>
        headerTitle="服务器列表"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button key="export">
            导出数据
            <DownOutlined />
          </Button>,
          <Button
            type="primary"
            key="add"
            onClick={() => {
              handleCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>
        ]}
        polling={polling || undefined}
        request={getAllServer}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
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
              项 &nbsp;&nbsp;
            </div>
          }
        >
          <Button
            type="primary"
            onClick={async () => {
              await handleMultipleDelete(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      {createModalVisible && <CreateForm
        onCancel={() => {
          handleCreateModalVisible(false);
        }}
        createModalVisible={createModalVisible}
        handleCreateModalVisible={handleCreateModalVisible}
        onSubmit={async (value) => {
          const success = await handleCreate(value);

          if (success) {
            handleCreateModalVisible(false);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      />
      }
      {updateModalVisible && <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);

          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        handleUpdateModalVisible={handleUpdateModalVisible}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
      />
      }
      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.ServerItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.ServerItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableNodeList;
