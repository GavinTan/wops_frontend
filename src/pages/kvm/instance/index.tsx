import {
  CaretRightOutlined, DesktopOutlined,
  EditTwoTone,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined, PlayCircleOutlined,
  PlusOutlined, PoweroffOutlined, RedoOutlined,
  ReloadOutlined, SettingOutlined
} from '@ant-design/icons';
import type {
  FormInstance
} from 'antd';
import {
  Button,
  Checkbox,
  Drawer,
  Form,
  message,
  Modal,
  Select,
  Tabs,
  Typography,
  Popconfirm,
  Tooltip, Row, Col, InputNumber, Space, Input
} from 'antd';

import React, {useEffect, useRef, useState} from 'react';
import {FooterToolbar, GridContent, PageContainer} from '@ant-design/pro-layout';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable, {TableDropdown} from '@ant-design/pro-table';
import type {ProDescriptionsItemProps} from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import type {FormValueType} from './components/CreateForm';
import CreateForm from './components/CreateForm';
import CreateFormCustom from './components/CreateFormCustom';
import CreateFormXml from './components/CreateFormXml';
import {
  createInstance,
  deleteInstance,
  getAllServer,
  getAllInstance,
  multipleDeleteInstance,
  updateInstance,
  actionInstance, getInstance
} from '@/services/wops/kvm';
import moment from "moment";
import "./index.less";
import CreateFormTpl from "@/pages/kvm/instance/components/CreateFormTpl";
import ProCard from "@ant-design/pro-card";
import {ModalForm, ProFormList, ProFormSelect, ProFormText, ProFormTextArea} from "@ant-design/pro-form";
import {getAllProxy} from "@/services/wops/assets";
import VmSetting from "@/pages/kvm/instance/components/VmSetting";


const handleCreate = async (data: API.InstanceItem) => {
  const hide = message.loading('正在添加', 0);

  try {
    return await createInstance({data}).then(res => {
      hide();
      if (res.errmsg) {
        message.error(res.errmsg);
        return false;
      }
      message.success('添加成功');
      return true;
    });

  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};


const handleUpdate = async (data: API.InstanceItem) => {
  const hide = message.loading('正在更新');

  try {
    await updateInstance(data.id as number, {data});
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败请重试！');
    return false;
  }
};


const handleDelete = async (data: API.InstanceItem) => {
  const hide = message.loading('正在删除');
  if (!data) return true;

  try {
    await deleteInstance(data.id as number, {data});
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const handleMultipleDelete = async (data: API.InstanceItem[]) => {
  const hide = message.loading('正在删除');
  if (!data) return true;

  try {
    await multipleDeleteInstance({
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


const VmView: React.FC = () => {
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [proxyModalVisible, setProxyModalVisible] = useState<boolean>(false);
    const [createSnapshotModalVisible, setCreateSnapshotModalVisible] = useState<boolean>(false);
    // const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
    // const [handleToVncModalVisible, setHandleToVncModalVisible] = useState<boolean>(false);
    const [showDetail, setShowDetail] = useState<boolean>(false);
    const actionRef = useRef<ActionType>();
    const [currentRow, setCurrentRow] = useState<API.InstanceItem>({} as API.InstanceItem);
    const [selectedRowsState, setSelectedRows] = useState<API.InstanceItem[]>([]);
    const [polling] = useState<number | undefined>(1000 * 30);
    const ref = useRef<FormInstance>();
    const [nodeSelectList, setNodeSelectList] = useState<{ label: React.ReactNode; value: number; }[]>([]);
    const [proxySelect, setProxySelect] = useState<any>([]);
    const [children, setChildren] = useState<string>('base');
    const [containerHeader, setContainerHeader] = useState<any>(undefined);
    const [selectTab, setSelectTab] = useState<string>('custom');
    const [createForm] = Form.useForm<API.InstanceItem>();
    const [tabList, setTabList] = useState([{tab: '虚拟机列表', key: 'base', closable: false}]);
    const [tabActiveKey, setTabActiveKey] = useState('base');
    const [instanceActiveId, setInstanceActiveId] = useState<any>();
    const proDescriptionsActionRef = useRef<ActionType>();
    const snapshotTableActionRef = useRef<ActionType>();
    const [getIpText, setGetIpText] = useState('获取IP');
    const [aa] = Form.useForm();

    useEffect(() => {
      getAllServer().then((res: any) => {
        setNodeSelectList(
          res.data.map((item: any) => ({
            label: item.host,
            value: item.id,
          })),
        );
      });

      getAllProxy().then(res => setProxySelect(res.data.map(item => ({label: item.ip, value: item.id}))));
    }, []);

    useEffect(() => {
      proDescriptionsActionRef.current?.reload();
      snapshotTableActionRef.current?.reload();
    }, [instanceActiveId]);

    const columns: ProColumns<API.InstanceItem>[] = [
      {
        title: '名称',
        dataIndex: 'name',
        render: (text, record) => {
          return (
            <a
              onClick={() => {
                setCurrentRow(record);
                // setShowDetail(true);
                setTabList(tabList.concat([{
                  tab: `虚拟机-${record.name}`,
                  key: `vm-${record.id}-${tabList.filter((i) => i.key.search('vm') !== -1).length + 1}`,
                  closable: true
                }]));
                setTabActiveKey(`vm-${record.id}-${tabList.filter((i) => i.key.search('vm') !== -1).length + 1}`);
                setChildren('vm');
                setInstanceActiveId(record.id);
              }}
            >
              {text}
            </a>
          );
        },
        fieldProps: {
          onChange: (e: any) => {
            if (e.target.value === '') {
              if (ref.current) {
                ref.current.submit();
              }
            }
          },
        },
      },
      {
        title: 'vCPU',
        dataIndex: 'vcpu',
        valueType: 'textarea',
        hideInSearch: true,
        sorter: (a, b) => a.vcpu! - b.vcpu!,
      },
      {
        title: '内存',
        dataIndex: 'current_memory',
        hideInSearch: true,
        sorter: (a: any, b: any) => Number(a.current_memory.replace(/\D/g, '')) - Number(b.current_memory.replace(/\D/g, '')),
      },
      {
        title: '宿主机',
        dataIndex: 'server',
        copyable: true,
        renderText: text => text.host,
        fieldProps: {
          onChange: () => {
            if (ref.current) {
              ref.current.submit();
            }
          },
        },
        renderFormItem: () => {
          return <Select
            options={nodeSelectList}
            // value={props.value}
            showSearch
            allowClear
            // onChange={props.onChange}
            placeholder="请选择"
            filterOption={(input: any, option: any) =>
              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          />;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        filters: true,
        onFilter: true,
        valueEnum: {
          '0': {
            text: '未知',
            status: 'Error',
          },
          '1': {
            text: '运行中',
            status: 'Processing',
          },
          '3': {
            text: '暂停',
            status: 'Warning',
          },
          '5': {
            text: '关机',
            status: 'Default',
          },
        },
        fieldProps: {
          onChange: () => {
            if (ref.current) {
              ref.current.submit();
            }
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
        render: (text, record: any, index, action) => [
          <Tooltip title="开机" key="start">
            <a onClick={async () => {
              if (record.status === 5) {
                await actionInstance({data: {instanceId: record.id, action: 'start'}}).then((res) => {
                  if (!res.errmsg) {
                    message.success('虚拟机已开机');
                    action?.reload();
                  }
                })
              }
            }}>
              <PlayCircleOutlined />
            </a>
          </Tooltip>,
          <Tooltip title="关机" key="shutdown">
            <a onClick={async () => {
              await actionInstance({data: {instanceId: record.id, action: 'shutdown'}}).then((res) => {
                if (!res.errmsg) {
                  message.success('虚拟机已关机');
                  action?.reload();
                }
              })
            }
            }>
              <PoweroffOutlined />
            </a>
          </Tooltip>,
          <Tooltip title="重启" key="reboot">
            <a onClick={async () => {
              await actionInstance({data: {instanceId: record.id, action: 'reboot'}}).then((res) => {
                if (!res.errmsg) {
                  message.success('虚拟机已重启');
                  action?.reload();
                }
              })
            }}>
              <RedoOutlined />
            </a></Tooltip>,
          <Tooltip title="连接" key="toVnc">
            <a onClick={() => {
              const {
                // @ts-ignore
                availTop, // 览器窗口在屏幕上的可占用空间上边距离屏幕上边界的像素值
                // @ts-ignore
                availLeft, // 返回浏览器可用空间左边距离屏幕（系统桌面）左边界的距离
                availHeight, // 浏览器在显示屏上的可用高度，即当前屏幕高度
                availWidth, // 浏览器在显示屏上的可用宽度，即当前屏幕宽度
              } = window.screen
              const pageWidth = 849 // 弹出窗口的宽度
              const pageHeight = 715 // 弹出窗口的高度
              let pageTop = (availHeight - pageHeight) / 2 // 窗口的垂直位置
              let pageLeft = (availWidth - pageWidth) / 2 // 窗口的水平位置;
              if (navigator.userAgent.indexOf('Chrome') !== -1) { // 兼容chrome的bug
                pageTop += availTop // 距顶偏移值
                pageLeft += availLeft // 距左偏移值
              }
              const win: any = window.open(`vnc?token=${record.uuid}`, '_blank', `width=${pageWidth},height=${pageHeight},top=${pageTop},left=${pageLeft}`) // 实现居中弹窗
              win.focus()
            }}><DesktopOutlined/>
            </a></Tooltip>,
          // <a
          //   key="toVnc"
          //   onClick={() => {
          //     handleUpdateModalVisible(true);
          //     setCurrentRow(row);
          //   }}
          // >
          //   连接
          // </a>,
          <TableDropdown
            key="actionGroup"
            onSelect={async (value) => {
              if (value === 'vmDelete') {
                Modal.confirm({
                  title: <>删除 <Typography.Text type="danger">{record.name}</Typography.Text> 虚拟机！</>,
                  icon: <ExclamationCircleOutlined/>,
                  content: <Checkbox.Group
                    style={{marginTop: 20}}
                    options={
                      [
                        {label: '删除快照', value: 'delSnapshot'},
                        {label: '删除硬盘文件', value: 'delDisk'}
                      ]
                    }
                    onChange={(checkedValue) => {
                      Object.assign(record, {delOption: checkedValue});
                    }}
                  />,
                  onOk: async () => {
                    await handleDelete(record);
                    action?.reload();
                  }
                })
              }
              if (value === 'destroy') {
                await actionInstance({data: {instanceId: record.id, action: 'destroy'}}).then((res) => {
                  if (!res.errmsg) {
                    message.success('虚拟机已关闭')
                    action?.reload()
                  }
                })
              }
            }}
            menus={[
              {
                key: 'destroy',
                name: '强制关机',
              },
              {
                key: 'vmDelete',
                name: '删除虚拟机',
              },
            ]}
          />,
        ],
      },
    ];
    return (
      <PageContainer
        header={containerHeader}
        tabList={tabList}
        tabActiveKey={tabActiveKey}
        onTabChange={(key) => {
          if (key === 'base') {
            console.log(123)
            setChildren('base');
          }
          if (key.search('create') !== -1) {
            setChildren('create');
          }
          if (key.search('vm') !== -1) {
            setChildren('vm');
            const instanceId = key.match(/-(\S*)-/);
            if (instanceId) {
              setInstanceActiveId(instanceId[1]);
            }
          }
          setTabActiveKey(key);
        }}
        tabProps={{
          type: 'editable-card',
          hideAdd: true,
          onEdit: (e) => {
            const tabs = tabList.filter((i) => i.key !== e)
            setTabList(tabs);
            if (tabs.length === 1) {
              setChildren('base');
              setTabActiveKey('base');
            }
          },
        }}
      >
        {children === 'create' && <Form
          form={createForm}
          labelCol={{span: 2}}
          wrapperCol={{offset: 4}}
          onFinish={async (values) => {
            const success = await handleCreate(values);

            if (success) {
              if (actionRef.current) {
                setContainerHeader(undefined)
                actionRef.current.reload();
                // createForm.resetFields();
              }
            }
          }}
        >
          <div className="card-container">
            <Tabs type="card" onChange={(activeKey) => {
              setSelectTab(activeKey)
            }}>
              <Tabs.TabPane tab="自定义" key="custom">
                {selectTab === 'custom' && <CreateFormCustom serverList={nodeSelectList}/>}
              </Tabs.TabPane>
              <Tabs.TabPane tab="模板" key="tpl">
                {selectTab === 'tpl' && <CreateFormTpl nodeList={nodeSelectList} form={createForm}/>}
              </Tabs.TabPane>
              <Tabs.TabPane tab="XML" key="xml">
                {selectTab === 'xml' && <CreateFormXml nodeList={nodeSelectList}/>}
              </Tabs.TabPane>
            </Tabs>
          </div>

          <FooterToolbar
            style={{
              left: 208,
              width: `calc(100% - 208px)`,
            }}
          >
            <Button type="primary" htmlType="submit">提交</Button>
          </FooterToolbar>
        </Form>}
        {children === 'base' && <>
          <ProTable<API.InstanceItem, API.PageParams>
            headerTitle="虚拟机列表"
            actionRef={actionRef}
            rowKey="id"
            search={{
              labelWidth: 120,
            }}
            formRef={ref}
            options={{
              reload: async () => {
                await getAllInstance({a: 'refresh'});
                actionRef.current?.reload();
              }
            }}
            toolBarRender={() => [
              <Button
                type="primary"
                key="primary"
                onClick={() => {
                  // setCreateModalVisible(true);
                  // setCreate(true);
                  // setContainerHeader({
                  //   onBack: () => {
                  //     setCreate(false);
                  //     setContainerHeader(undefined)
                  //   },
                  //   title: '新建虚拟机'
                  // })
                  setTabList(tabList.concat([{
                    tab: '新建虚拟机',
                    key: `create${tabList.filter((i) => i.key.search('create') !== -1).length + 1}`,
                    closable: true
                  }]));
                  setTabActiveKey(`create${tabList.filter((i) => i.key.search('create') !== -1).length + 1}`);
                  setChildren('create');
                }}
              >
                <PlusOutlined/> 新建
              </Button>,
            ]}
            pagination={{
              defaultPageSize: 10,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            polling={polling || undefined}
            request={getAllInstance}
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
            ><Popconfirm
              title="会删除虚拟机磁盘文件和快照！"
              okType="danger"
              onConfirm={async () => {
                await handleMultipleDelete(selectedRowsState);
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }
              }
            >
              <Button>批量删除</Button>
            </Popconfirm>
              <Button type="primary">批量审批</Button>
            </FooterToolbar>
          )}
          <CreateForm
            onSubmit={async (value) => {
              const success = await handleCreate(value);

              if (success) {
                setCreateModalVisible(false);
                setCurrentRow(undefined);

                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }
            }}
            onCancel={() => {
              setCreateModalVisible(false);
              setCurrentRow(undefined);
            }}
            createModalVisible={createModalVisible}
            nodeList={nodeSelectList}
          />

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
              <ProDescriptions<API.InstanceItem>
                column={2}
                title={currentRow?.name}
                request={async () => ({
                  data: currentRow || {},
                })}
                params={{
                  id: currentRow?.name,
                }}
                columns={columns as ProDescriptionsItemProps<API.InstanceItem>[]}
              />
            )}
          </Drawer>
        </>
        }
        {children === 'vm' && <ProCard gutter={24}>
          <ProCard
            title={<span style={{color: "#1890ff", fontSize: 20}}><InfoCircleOutlined/> 虚拟机信息</span>}
            colSpan={8}
            headerBordered
          >
            <ProDescriptions
              bordered
              editable={{
                onSave: async (key, row) => {
                  if (key === 'name') {
                    await actionInstance({
                      data: {instanceId: row.id, name: row.name, action: 'setName'}
                    }).then(res => {
                      if (res.errmsg) {
                        message.error(res.errmsg);
                        throw new Error(res.errmsg);
                      } else {
                        message.success('修改名称成功');

                        setTabList([...tabList].map(item => {
                          if (item.key === tabActiveKey) {
                            item.tab = `虚拟机-${row.name}`;
                          }
                          return item;
                        }));
                      }
                    })
                  }
                  if (key === 'memory') {
                    await actionInstance({data: {instanceId: row.id, memory: row.memory, action: 'setMemory'}}).then(res => {
                      console.log(res)
                    })
                  }
                }
              }}
              size="middle"
              column={1}
              request={async () => {
                return getInstance(instanceActiveId);
              }}
              actionRef={proDescriptionsActionRef}
              columns={[
                {title: '名称', valueType: 'text', dataIndex: 'name'},
                {
                  title: '宿主机',
                  valueType: 'text',
                  dataIndex: 'server',
                  editable: false,
                  render: (text: any) => <Typography.Text copyable>{text.host}</Typography.Text>
                },
                {
                  title: 'IP',
                  valueType: 'text',
                  dataIndex: 'ip',
                  editable: false,
                  render: (text, record) => {
                    if (text) {
                      return <><Typography.Text copyable>{text}</Typography.Text> <a onClick={async () => {
                        setGetIpText('获取中');
                        await actionInstance({data: {instanceId: record.id, action: 'getIp'}}).then(() => {
                          proDescriptionsActionRef.current?.reload();
                        }).finally(() => setGetIpText('获取ip'));
                      }}><Tooltip title="更新"><ReloadOutlined spin={getIpText === '获取中'}/></Tooltip></a></>;
                    }
                    if (getIpText === '获取中') {
                      return <><LoadingOutlined spin/> {getIpText}</>
                    }
                    return <a onClick={async () => {
                      setGetIpText('获取中');
                      await actionInstance({data: {instanceId: record.id, action: 'getIp'}}).then(() => {
                        proDescriptionsActionRef.current?.reload();
                      }).finally(() => setGetIpText('获取ip'));
                    }}>{getIpText}</a>
                  }
                },
                {
                  title: '代理',
                  valueType: 'text',
                  dataIndex: 'http_proxy',
                  editable: false,
                  render: (text: any) => {
                    if (text) {
                      return <><Typography.Text copyable>{text.ip}</Typography.Text>
                        <a onClick={() => setProxyModalVisible(true)}> <Tooltip title="修改"><EditTwoTone/></Tooltip></a>
                      </>;
                    }
                    return <a onClick={() => {
                      setProxyModalVisible(true);
                    }}>绑定代理</a>;
                  }
                },
                {title: '描述', valueType: 'textarea', dataIndex: 'desc', editable: false},
                {title: '创建时间', valueType: 'dateTime', dataIndex: 'create_time', editable: false},
              ]}
            />
          </ProCard>
          <ProCard
            title={<span style={{color: "#1890ff", fontSize: 20}}><SettingOutlined/> 虚拟机配置</span>}
            headerBordered
          ><ProCard tabs={{
            type: 'card',
          }} bordered>
            <ProCard.TabPane key="option" tab="选项">
              <Space>
              <Button>开机</Button>
              <Button>重启</Button>
              <Button>关机</Button>
              <Button>强制关机</Button>
              <Button onClick={() => {
                const {
                // @ts-ignore
                availTop, // 览器窗口在屏幕上的可占用空间上边距离屏幕上边界的像素值
                // @ts-ignore
                availLeft, // 返回浏览器可用空间左边距离屏幕（系统桌面）左边界的距离
                availHeight, // 浏览器在显示屏上的可用高度，即当前屏幕高度
                availWidth, // 浏览器在显示屏上的可用宽度，即当前屏幕宽度
              } = window.screen
              const pageWidth = 849 // 弹出窗口的宽度
              const pageHeight = 715 // 弹出窗口的高度
              let pageTop = (availHeight - pageHeight) / 2 // 窗口的垂直位置
              let pageLeft = (availWidth - pageWidth) / 2 // 窗口的水平位置;
              if (navigator.userAgent.indexOf('Chrome') !== -1) { // 兼容chrome的bug
                pageTop += availTop // 距顶偏移值
                pageLeft += availLeft // 距左偏移值
              }
              const win: any = window.open(`console?instanceId=${currentRow.id}`, '_blank', `width=${pageWidth},height=${pageHeight},top=${pageTop},left=${pageLeft}`) // 实现居中弹窗
              win.focus()
              }}>连接</Button>
                </Space>
            </ProCard.TabPane>
            <ProCard.TabPane key="config" tab="配置">
              <VmSetting value={currentRow}/>
            </ProCard.TabPane>
            <ProCard.TabPane key="snapshot" tab="快照">
              <ProTable
                search={false}
                headerTitle={
                  <Button
                    type="primary"
                    onClick={() => setCreateSnapshotModalVisible(true)}><PlusOutlined/> 添加</Button>
                }
                rowKey="id"
                actionRef={snapshotTableActionRef}
                columns={[
                  {title: '名称', dataIndex: 'name'},
                  {title: '状态', dataIndex: 'state'},
                  {title: '时间', dataIndex: 'create_time'},
                  {title: '描述', dataIndex: 'desc'},
                  {
                    title: '操作',
                    valueType: 'option',
                    render: (text, record, index, action) => [
                      <a key="revert" onClick={async () => {
                        const hide = message.loading('恢复快照中', 0);
                        await actionInstance({
                          data: {
                            instanceId: currentRow?.id,
                            name: record.name,
                            action: 'revertSnapshot'
                          }
                        }).then(() => {
                          message.success('恢复快照成功');
                        }).finally(() => hide());
                      }}>恢复</a>,
                      <a key="delete" onClick={async () => {
                        const hide = message.loading('删除中', 0);
                        await actionInstance({
                          data: {
                            instanceId: currentRow?.id,
                            name: record.name,
                            action: 'delSnapshot'
                          }
                        }).then(() => {
                          message.success('删除快照成功');
                          action?.reload();
                        }).finally(() => hide());
                      }}>删除</a>]
                  }]}
                request={async () => {
                  const data = {};
                  await actionInstance({
                    data: {
                      instanceId: instanceActiveId,
                      action: 'getSnapshot'
                    }
                  }).then(res => Object.assign(data, {...res, total: res.data.length}))
                  return data;
                }}
              />
            </ProCard.TabPane>
          </ProCard>
          </ProCard>
        </ProCard>
        }
        {proxyModalVisible && <ModalForm
          title="设置代理"
          width="400px"
          visible={proxyModalVisible}
          onVisibleChange={setProxyModalVisible}
          initialValues={{proxy: currentRow!.http_proxy?.id}}
          onFinish={async value => {
            await actionInstance({data: {id: currentRow!.id, action: 'setProxy', ...value}}).then(res => {
              setCurrentRow(Object.assign(currentRow, {...res.data}));
              setProxyModalVisible(false);
            })
          }}
        >
          <ProFormSelect
            name="proxy"
            width="md"
            options={proxySelect}
            fieldProps={{
              showSearch: true,
              filterOption: (input, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }}
          />
        </ModalForm>
        }
        {createSnapshotModalVisible && <ModalForm
          title="新建快照"
          width="400px"
          visible={createSnapshotModalVisible}
          onVisibleChange={setCreateSnapshotModalVisible} onFinish={async value => {
          await actionInstance({data: {instanceId: currentRow?.id, action: 'createSnapshot', ...value}}).then(() => {
            message.success('创建快照成功');
            setCreateSnapshotModalVisible(false);
            snapshotTableActionRef.current?.reload();
          })
        }}
        >
          <ProFormText
            label="名称"
            name="name"
            width="md"
            rules={[{required: true}]}
          />
          <ProFormTextArea
            label="描述"
            name="desc"
            width="md"
          />
        </ModalForm>

        }
      </PageContainer>
    );
  }
;


export default VmView;
