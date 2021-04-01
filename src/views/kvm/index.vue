<template>
  <div id="ffff" class="app-container">
    <el-row>
      <el-col :xs="24" :sm="24" :md="8" :lg="5" :xl="4">
        <el-input v-model="filterText" placeholder="搜索" style="width: 80%;" size="mini" prefix-icon="el-icon-search" />
        <el-tree ref="tree" :filter-node-method="filterNode" :expand-on-click-node="false" default-expand-all :data="treeData" :props="defaultProps" @node-click="handleNodeClick" @node-contextmenu="rightClick">
          <span slot-scope="{node, data}">
            <span>
              <i v-if="data.type === 'node'" class="el-icon-s-platform" />
              <i v-if="data.type === 'default'" class="el-icon-folder-opened" />
              {{ node.label }}
            </span>
            <span v-if="data.number">({{ data.number }})</span>
          </span>
        </el-tree>
      </el-col>
      <el-col :xs="24" :sm="24" :md="16" :lg="19" :xl="20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-input v-model="tableSearch" style="width: 200px;float: right;" class="filter-item" placeholder="搜索" prefix-icon="el-icon-search" />
            <!--            <el-button type="primary" style="float: right" icon="el-icon-edit" @click="showAddNode">添加</el-button>-->
          </div>

          <el-table
            ref="table"
            :data="table"
            style="width: auto"
            row-key="id"
            highlight-current-row
            :expand-row-keys="expends"
            :tree-props="{children: 'vm_data', hasChildren: 'hasChildren'}"
          >
            <el-table-column label="#" width="50" />
            <el-table-column label="主机" prop="host">
              <template slot-scope="scope">
                <div v-if="scope.row.vm_data">
                  {{ scope.row.host }}
                </div>
                <div v-else :ref="scope.row.name">
                  <el-link @click="getVmInfo(scope.row)">{{ scope.row.name }}</el-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="status">
              <template slot-scope="scope">
                <div v-if="scope.row.vm_data">
                  <el-tag v-if="scope.row.status" type="success">Connected</el-tag>
                  <el-tag v-else type="danger">Not Connected</el-tag>
                </div>
                <div v-else>
                  <span v-if="scope.row.status === 1" style="color: #67C23A">运行</span>
                  <span v-if="scope.row.status === 5" style="color: #909399">关机</span>
                  <span v-if="scope.row.status === 3" style="color: #E6A23C">暂停</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="CPU" prop="cpu" />
            <el-table-column label="内存" prop="memory" />
            <el-table-column label="内存使用量 / 操作" width="300">
              <template slot-scope="scope">
                <div v-if="!scope.row.vm_data">
                  <el-button-group>
                    <el-tooltip v-show="scope.row.status === 5" content="开机">
                      <el-button size="mini" type="info" icon="el-icon-video-play" @click="sendActionVmClick('start', scope.row)" />
                    </el-tooltip>
                    <el-tooltip v-show="scope.row.status === 3" content="恢复">
                      <el-button size="mini" type="info" icon="el-icon-video-play" @click="sendActionVmClick('resume', scope.row)" />
                    </el-tooltip>
                    <el-tooltip v-show="scope.row.status === 1" content="暂停">
                      <el-button size="mini" type="info" icon="el-icon-video-pause" @click="sendActionVmClick('suspend', scope.row)" />
                    </el-tooltip>
                    <el-tooltip content="关机">
                      <el-button :disabled="scope.row.status !== 1" size="mini" type="info" icon="el-icon-switch-button" @click="sendActionVmClick('shutdown', scope.row)" />
                    </el-tooltip>
                    <el-tooltip content="删除">
                      <el-button size="mini" type="info" icon="el-icon-delete" @click.native.prevent="delVmClick(scope.row)" />
                    </el-tooltip>
                    <el-tooltip content="连接">
                      <el-button size="mini" type="info" icon="el-icon-s-platform" @click="toVncClick(scope.row)" />
                    </el-tooltip>
                  </el-button-group>
                </div>
                <div v-else>
                  <el-progress v-if="scope.row.memory_usage < 60" :text-inside="true" :stroke-width="15" :percentage="scope.row.memory_usage" status="success" />
                  <el-progress v-if="scope.row.memory_usage >= 60 && scope.row.memory_usage < 80" :text-inside="true" :stroke-width="15" :percentage="scope.row.memory_usage" status="warning" />
                  <el-progress v-if="scope.row.memory_usage >= 80" :text-inside="true" :stroke-width="15" :percentage="scope.row.memory_usage" status="exception" />
                </div>
              </template>

            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <div ref="menu" class="right-menu" :show="contextMenuVisible">
      <el-menu class="el-menu-vertical-demo" popper-class="el-menu-vertical-demo">
        <div v-if="rightClickValue.type === 'default'">
          <el-menu-item disabled @click="showAddNode">
            <i class="el-icon-circle-plus-outline" />
            <span slot="title">添加分组</span>
          </el-menu-item>
          <el-divider />
          <el-menu-item @click="addNodeDialogVisible = true">
            <i class="el-icon-circle-plus-outline" />
            <span slot="title">添加节点</span>
          </el-menu-item>
          <el-divider />
          <el-menu-item @click="refreshDataClick">
            <i class="el-icon-refresh" />
            <span slot="title">刷新数据</span>
          </el-menu-item>
        </div>
        <div v-if="rightClickValue.type === 'node'">
          <el-menu-item :disabled="!rightClickValue.status" @click="addVmDialogVisible = true">
            <i class="el-icon-circle-plus-outline" />
            <span slot="title">添加虚拟机</span>
          </el-menu-item>
          <!--          <el-divider />-->
          <!--          <el-menu-item>-->
          <!--            <i class="el-icon-edit" />-->
          <!--            <span slot="title">编辑</span>-->
          <!--          </el-menu-item>-->
          <el-divider />
          <el-menu-item @click="delNodeClick">
            <i class="el-icon-delete" />
            <span slot="title">删除节点</span>
          </el-menu-item>
        </div>
      </el-menu>
    </div>

    <el-dialog title="添加节点" :visible.sync="addNodeDialogVisible" :width="dialogWidth">
      <el-form ref="nodeFormRef" :model="nodeForm" label-position="left" label-width="70px" :rules="nodeFormRules">
        <el-form-item label="IP" prop="host">
          <el-input v-model="nodeForm.host" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="nodeForm.username" value="root" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="nodeForm.password" show-password />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="nodeForm.conn_type" placeholder="请选择连接类型">
            <el-option label="SSH" value="ssh" />
            <el-option label="TCP" value="tcp" />
            <el-option label="TLS" value="tls" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addNodeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addNodeClick">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="添加虚拟机" :visible.sync="addVmDialogVisible" width="40%" :close-on-click-modal="false" :before-close="addVmDialogClose">
      <el-form ref="vmFormRef" :model="vmForm" label-position="left" label-width="85px" :rules="vmFormRules">
        <el-form-item label="名称" prop="name">
          <el-input v-model="vmForm.name" />
        </el-form-item>
        <el-form-item label="CPU" prop="cpu">
          <el-autocomplete v-model="vmForm.cpu" style="width: 100%" :fetch-suggestions="cpuFetch" oninput="value=value.replace(/[^\d]/g,'')">
            <template slot="append">核</template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="内存" prop="memory">
          <el-autocomplete v-model="vmForm.memory" style="width: 100%" :fetch-suggestions="memoryFetch" oninput="value=value.replace(/[^\d]/g,'')">
            <template slot="append">MB</template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="磁盘" prop="disk_size">
          <el-input v-model="vmForm.disk_size" style="width: 100%" oninput="value=value.replace(/[^\d]/g,'')">
            <template slot="append">GB</template>
          </el-input>
        </el-form-item>
        <el-form-item label="存储池" prop="storage">
          <el-select v-model="vmForm.storage" style="width: 100%" placeholder="请选择存储池">
            <el-option v-for="storage in storages" :key="storage.name" :label="storage.name" :value="storage.name">
              <span style="float: left">{{ storage.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ storage.path }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="镜像文件" prop="image">
          <el-select v-model="vmForm.image" style="width: 100%" placeholder="请选择镜像文件">
            <el-option v-for="image in images" :key="image" :label="image" :value="image" />
          </el-select>
        </el-form-item>
        <el-form-item label="软驱" prop="floppy">
          <el-select v-model="vmForm.floppy" style="width: 100%" placeholder="请选择驱动文件">
            <el-option v-for="floppy in floppys" :key="floppy" :label="floppy" :value="floppy" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVmDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addVmClick">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog v-el-drag-dialog append-to-body title="虚拟机" :visible.sync="vmInfoVisible" class="vm-info-dialog">
      <el-tabs>
        <el-tab-pane label="概述">
          <el-row style="margin-top: 20px">
            <el-col :span="14">
              <div style="margin-bottom: 20px">
                <label class="label" style="margin-right: 10px">名称:</label>
                {{ vmInfoData.name }}
              </div>
              <div style="margin-bottom: 20px">
                <label class="label" style="margin-right: 10px">UUID:</label>
                {{ vmInfoData.id }}
              </div>
              <div style="margin-bottom: 20px">
                <label class="label" style="margin-right: 10px">MAC:</label>
                <span v-if="vmInfoData.networks && vmInfoData.networks.length > 0">{{ vmInfoData.networks[0].mac }}</span>
              </div>
              <div style="margin-bottom: 20px">
                <label class="label" style="margin-right: 10px">IP:</label>
                <span v-if="vmInfoData.networks && vmInfoData.networks.length > 0">{{ vmInfoData.networks[0].ipv4 }}</span>
              </div>
              <div style="margin-bottom: 20px">
                <label class="label" style="margin-right: 10px">节点:</label>
                {{ vmInfoData.node }}
              </div>
            </el-col>
            <el-col :span="10">
              <div style="margin-bottom: 20px">
                <label class="label" style="margin-right: 10px">CPU:</label>
                {{ vmInfoData.cpu }}
              </div>
              <div style="margin-bottom: 20px">
                <label class="label" style="margin-right: 10px">内存:</label>
                {{ vmInfoData.memory }}
              </div>
              <div style="margin-bottom: 20px">
                <label class="label" style="margin-right: 10px">终端类型:</label>
                {{ vmInfoData.console_type }}
              </div>
              <div style="margin-bottom: 20px">
                <label class="label" style="margin-right: 10px">终端端口:</label>
                {{ vmInfoData.console_port }}
              </div>
              <div style="margin-bottom: 20px">
                <label class="label" style="margin-right: 10px">开机自启:</label>
                {{ vmInfoData.vid }}
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="磁盘" name="second">
          <el-table :data="vmDiskTableData" style="width: 100%">
            <el-table-column prop="device" label="Device" width="100" />
            <el-table-column label="used" width="120">
              <template slot-scope="scope">
                {{ scope.row.used }}
              </template>
            </el-table-column>
            <el-table-column prop="size" label="size" width="120" />
            <el-table-column prop="bus" label="bus" width="80" />
            <el-table-column prop="path" label="path" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="网络" name="third">
          <el-table :data="vmNetworkTableData" style="width: 100%">
            <el-table-column prop="type" label="Type" />
            <el-table-column prop="model" label="Model" />
            <el-table-column prop="mac" label="MAC" />
            <el-table-column prop="nic" label="Nic" />
            <el-table-column prop="state" label="State" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="终端" name="console">
          <iframe scrolling="no" frameborder="0" height="800px" width="100%" :src="routeData.href" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/kvm'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  directives: { elDragDialog },
  data() {
    return {
      treeData: [{
        label: 'Servers',
        type: 'default',
        number: '',
        children: []
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      cpuCoreList: [
        { value: '1' },
        { value: '2' },
        { value: '4' },
        { value: '8' },
        { value: '16' },
        { value: '32' }
      ],
      memoryList: [
        { value: '1024' },
        { value: '2048' },
        { value: '4096' },
        { value: '8192' },
        { value: '16384' },
        { value: '32768' }
      ],
      storages: [],
      images: [],
      floppys: [],
      tableData: [],
      vmDiskTableData: [],
      vmNetworkTableData: [],
      expends: [],
      delNode: '',
      isExpand: false,
      tableSearch: '',
      vncPath: '/kvm/vnc',
      routeData: '',
      dialogWidth: '40%',
      vmInfoVisible: false,
      btnSuspendVisible: false,
      btnResumeVisible: false,
      addNodeDialogVisible: false,
      addVmDialogVisible: false,
      contextMenuVisible: false,
      rightClickValue: '',
      filterText: '',
      vmInfoData: {},
      nodeForm: {
        host: '',
        username: 'root',
        password: '',
        conn_type: 'ssh'
      },
      vmForm: {},
      nodeFormRules: {
        conn_type: [{ required: true, message: '必填', trigger: 'change' }],
        host: [{ required: true, message: '必填', trigger: 'blur' }]
      },
      vmFormRules: {
        name: [{ required: true, message: '必填', trigger: 'blur' }],
        cpu: [{ required: true, message: '必填', trigger: 'change' }],
        memory: [{ required: true, message: '必填', trigger: 'change' }],
        disk_size: [{ required: true, message: '必填', trigger: 'blur' }],
        storage: [{ required: true, message: '必填', trigger: 'change' }],
        image: [{ required: true, message: '必填', trigger: 'change' }]
      }
    }
  },
  computed: {
    table: function() {
      const search = this.tableSearch
      let selectRow = {}
      if (search) {
        const data = this.tableData.filter(function(element) {
          if (String(element['host']).toLowerCase().indexOf(search) > -1) {
            return true
          } else {
            return element['vm_data'].some((item) => {
              const str = String(item['host']) + String(item['name'])
              if (str.toLowerCase().indexOf(search) > -1) {
                selectRow = item
                return true
              }
              return false
            })
          }
        })

        this.$nextTick(() => {
          this.$refs.table.setCurrentRow(selectRow)
          // console.log(this.$refs[selectRow.name].position)
          if (Object.prototype.hasOwnProperty.call(selectRow, 'name')) {
            // document.getElementById('aabb').scrollIntoView(true)

            window.scrollTo({
              top: this.$refs[selectRow.name].getBoundingClientRect().top - 200,
              behavior: 'smooth'
            })
            // document.body.scrollTop = this.$refs[selectRow.name].offsetTop
          }
        })
        return data
      }
      return this.tableData
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getAllVmData()
  },
  methods: {
    refreshDataClick() {
      const action = 'refresh'
      this.getAllVmData(action)
    },
    memoryFetch(queryString, cb) {
      const restaurants = this.memoryList
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    cpuFetch(queryString, cb) {
      const restaurants = this.cpuCoreList
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    hidePanel(e) {
      this.contextMenuVisible = false
      document.removeEventListener('click', this.hidePanel, false)
      this.$refs.menu.style.display = 'none'
    },
    rightClick(MouseEvent, object, Node, element) {
      if (Node.data.type === 'node' && Node.data.status) {
        api.getStorage(Node.data.id).then(response => {
          this.storages = response.data
        })
        api.getStorageImages(Node.data.id).then(response => {
          this.images = response.data
        })
        api.getStorageFloppys(Node.data.id).then(response => {
          this.floppys = response.data
        })
        this.vmForm.node = Node.data.id
      }
      document.addEventListener('click', this.hidePanel, false)
      this.contextMenuVisible = true
      this.delNode = Node.data
      this.rightClickValue = Node.data
      const menu = this.$refs.menu
      menu.style.display = 'block'
      menu.style.left = MouseEvent.clientX - 0 + 'px'
      menu.style.top = MouseEvent.clientY - 0 + 'px'
    },
    handleNodeClick(data) {
      if (data.type === 'default') {
        this.expends = []
        this.getAllVmData(null, false)
      } else {
        api.getVmData(data.id).then(response => {
          this.expends.push(String(response.data.id))
          // this.$refs.table.toggleRowExpansion(response.data[0])
          // console.log(this.$refs.table.toggleRowExpansion)
          this.tableData = [response.data]
        })
      }
    },
    addVmDialogClose(done) {
      this.$refs.vmFormRef.resetFields()
      done()
    },
    showAddNode() {
      this.addNodeDialogVisible = true
    },
    getVmInfo(row) {
      this.vmInfoData = row
      this.vmInfoVisible = true
      this.vmDiskTableData = row['disks']
      this.vmNetworkTableData = row['networks']
      this.routeData = this.$router.resolve({ path: this.vncPath, query: { token: row.id }})
    },
    addNodeClick() {
      this.$refs.nodeFormRef.validate(valid => {
        if (valid) {
          this.addNodeDialogVisible = false
          api.addNode(this.nodeForm).then(response => {
            this.getAllVmData()
            this.$message({
              type: 'success',
              message: '添加成功'
            })
          })
        }
      })
    },
    addVmClick() {
      this.$refs.vmFormRef.validate(valid => {
        if (valid) {
          this.addVmDialogVisible = false
          api.addVm(this.vmForm).then(response => {
            this.expends.push(String(response.data.id))
            this.tableData = response.data
            this.$message({
              type: 'success',
              message: '添加成功'
            })
          })
        }
      })
    },
    delNodeClick() {
      const h = this.$createElement
      this.$confirm(h('p', null, [
        h('span', null, '确认删除 '),
        h('i', { style: 'color: teal' }, this.delNode.label),
        h('span', null, ' 服务器吗？')
      ]), '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await api.deleteNode(this.delNode.id).then(response => {
          if (response.code === 20000) {
            console.log(this.tableData)
            this.treeData[0].children.splice(this.treeData[0].children.indexOf(this.delNode.data), 1)
            this.tableData.splice(response.data, 1)
            console.log(response.data)
            this.$message({
              type: 'success',
              message: '删除成功'
            })
          } else {
            this.$message({
              type: 'error',
              message: '删除失败'
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    getAllVmData(action = 'all', menu = true) {
      api.getAllVmData(action).then(response => {
        this.tableData = response.data
        if (menu) {
          const data = []
          response.data.forEach((item) => {
            data.push({ 'label': item.host, 'id': item.id, 'type': 'node', 'status': item.status, 'number': item.vm_data.length })
          })
          this.treeData[0].children = data
          this.treeData[0].number = data.length
          if (action === 'refresh') {
            this.$message({
              type: 'success',
              message: '刷新成功'
            })
          }
        }
      })
    },
    sendActionVmClick(action, row) {
      api.actionVM(action, row.id).then(response => {
        if (action === 'suspend') {
          this.$set(row, 'status', 3)

          this.$message({
            type: 'success',
            message: '虚拟机已暂停'
          })
        }
        if (action === 'resume') {
          this.$set(row, 'status', 1)

          this.$message({
            type: 'success',
            message: '虚拟机已恢复'
          })
        }
        if (action === 'start') {
          this.$set(row, 'status', 1)

          this.$message({
            type: 'success',
            message: '虚拟机已启动'
          })
        }
        if (action === 'shutdown') {
          this.$set(row, 'status', 5)

          this.$message({
            type: 'success',
            message: '虚拟机已关机'
          })
        }
      })
    },
    toVncClick(row) {
      const width = 900
      const height = 700
      const left = (screen.width / 2) - (width / 2)
      const top = (screen.height / 2) - (height / 2)
      const routeData = this.$router.resolve({ path: this.vncPath, query: { token: row.id }})

      const win = window.open(routeData.href, '_blank', 'width=' + width + ', height=' + height + ',  top=' + top + ', left=' + left)
      win.focus()
    },
    delVmClick(row) {
      const tableData = this.tableData
      const h = this.$createElement
      let delDisk = false
      let diskPath = ''
      if (this.$refs.imageCheckboxRef) {
        this.$refs.imageCheckboxRef.model = false
      }
      row.disks.forEach((item) => {
        if (item.device === 'disk') {
          diskPath = item.path
        }
      })

      this.$confirm(
        h('div', null, [
          h('p', null, [
            h('span', null, '确认删除 '),
            h('i', { style: 'color: teal' }, row.name),
            h('span', null, ' 虚拟机吗？')
          ]), (diskPath)
            ? h('p', null, [
              h('span', null, '镜像文件： '),
              h('el-checkbox', { domProps: { checked: false }, on: { change(event) { delDisk = event } }, props: { label: diskPath }, ref: 'imageCheckboxRef' })
            ])
            : ''
        ]),
        '警告', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
        tableData.forEach((item) => {
          if (item['host'] === row.node) {
            api.deleteVM(row.id, delDisk).then(response => {
              item.vm_data.splice(item.vm_data.indexOf(row), 1)
              this.$message({
                type: 'success',
                message: '删除成功'
              })
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .mailTable, .mailTable tr, .mailTable tr td{ border:1px solid #E6EAEE; }
  .mailTable{ border-collapse: collapse; width: 90%; margin: auto; }
  .mailTable tr td{ border:1px solid #c7ecb8; width: 150px; height: 35px; line-height: 40px; box-sizing: border-box; padding: 0 10px; }
  .mailTable tr td.column { background-color: #EFF3F6; color: #393C3E; width: 20%;}

  .right-menu {
    position: fixed;
    z-index: 999;
    display: none;
    border: 1px solid #eee;
    box-shadow: 0 0.5em 1em 0 rgba(0,0,0,.1);
    border-radius: 1px;
  }

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 140px;
    min-height: 90px;
  }

  .el-menu .el-menu-item {
    height: 45px;
    line-height: 45px;
    width: auto;
  }

  .el-divider--horizontal{
    margin: 1px 0;
    background: 0 0;
    border-top: 1px solid #e8eaec;
  }

  .vm-info-dialog ::v-deep .el-dialog__body {
    padding: 0px 20px 30px;
  }

</style>
