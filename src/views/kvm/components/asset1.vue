<template>
  <div class="app-container">
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
        <el-table
          :key="tableKey"
          v-loading="listLoading"
          :data="list"
          border
          fit
          highlight-current-row
          style="width: 100%;"
          @sort-change="sortChange"
        >
          <el-table-column label="序号" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
            <template slot-scope="{row}">
              <span>{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="IP" width="150px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="宿主机" min-width="150px">
            <template slot-scope="{row}">
              <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
              <el-tag>{{ row.type | typeFilter }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.author')" width="110px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.author }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="showReviewer" :label="$t('table.reviewer')" width="110px" align="center">
            <template slot-scope="{row}">
              <span style="color:red;">{{ row.reviewer }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.importance')" width="80px">
            <template slot-scope="{row}">
              <svg-icon v-for="n in +row.importance" :key="n" icon-class="star" class="meta-item__icon" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.readings')" align="center" width="95">
            <template slot-scope="{row}">
              <span v-if="row.pageviews" class="link-type" @click="handleFetchPv(row.pageviews)">{{ row.pageviews }}</span>
              <span v-else>0</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
            <template slot-scope="{row}">
              <el-tag :type="row.status | statusFilter">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">
              <el-button type="primary" size="mini" @click="handleUpdate(row)">
                {{ $t('table.edit') }}
              </el-button>
              <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleModifyStatus(row,'published')">
                {{ $t('table.publish') }}
              </el-button>
              <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">
                {{ $t('table.draft') }}
              </el-button>
              <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
                {{ $t('table.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
          <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
            <el-form-item :label="$t('table.type')" prop="type">
              <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
                <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('table.date')" prop="timestamp">
              <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />
            </el-form-item>
            <el-form-item :label="$t('table.title')" prop="title">
              <el-input v-model="temp.title" />
            </el-form-item>
            <el-form-item :label="$t('table.status')">
              <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
                <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('table.importance')">
              <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />
            </el-form-item>
            <el-form-item :label="$t('table.remark')">
              <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">
              {{ $t('table.cancel') }}
            </el-button>
            <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
              {{ $t('table.confirm') }}
            </el-button>
          </div>
        </el-dialog>

        <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
          <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
            <el-table-column prop="key" label="Channel" />
            <el-table-column prop="pv" label="Pv" />
          </el-table>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
          </span>
        </el-dialog>

        <div ref="menu" class="right-menu" :show="contextMenuVisible">
          <el-menu class="el-menu-vertical-demo" popper-class="el-menu-vertical-demo">
            <div v-if="rightClickValue.type === 'default'">
              <el-menu-item @click="addGroupDialogVisible = true">
                <i class="el-icon-circle-plus-outline" />
                <span slot="title">添加分组</span>
              </el-menu-item>
              <el-divider />
              <el-menu-item>
                <i class="el-icon-refresh" />
                <span slot="title">刷新数据</span>
              </el-menu-item>
            </div>
            <div v-else>
              <el-menu-item>
                <i class="el-icon-circle-plus-outline" />
                <span slot="title">添加分组</span>
              </el-menu-item>
              <el-divider />
              <el-menu-item>
                <i class="el-icon-circle-plus-outline" />
                <span slot="title">添加节点</span>
              </el-menu-item>
              <el-divider />
              <el-menu-item>
                <i class="el-icon-edit" />
                <span slot="title">重命名</span>
              </el-menu-item>
              <el-divider />
              <el-menu-item>
                <i class="el-icon-delete" />
                <span slot="title">删除分组</span>
              </el-menu-item>
              <el-divider />
              <el-menu-item>
                <i class="el-icon-delete" />
                <span slot="title">删除节点</span>
              </el-menu-item>
            </div>
          </el-menu>
        </div>

        <el-dialog title="添加分组" :visible.sync="addGroupDialogVisible" width="40%">
          <el-form ref="addGroupFormRef" :model="addGroupForm" label-position="left" label-width="70px" :rules="addGroupFormRules">
            <el-form-item label="名称" prop="name">
              <el-input v-model="addGroupForm.name" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="addGroupDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addGroupClick">确 定</el-button>
          </div>
        </el-dialog>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      treeData: [{
        label: 'Assets',
        type: 'default',
        number: '',
        children: []
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      contextMenuVisible: false,
      rightClickValue: '',
      filterText: '',
      addGroupDialogVisible: false,
      addGroupForm: {
        'name': ''
      },
      addGroupFormRules: {
        name: [{ required: true, message: '必填', trigger: 'blur' }]
      },
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    rightClick(MouseEvent, object, Node, element) {
      document.addEventListener('click', this.hidePanel, false)
      this.contextMenuVisible = true
      this.rightClickValue = Node.data
      const menu = this.$refs.menu
      menu.style.display = 'block'
      menu.style.left = MouseEvent.clientX - 0 + 'px'
      menu.style.top = MouseEvent.clientY - 0 + 'px'
    },
    handleNodeClick(data) {

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
    addGroupClick() {
      this.$refs.addGroupFormRef.validate(valid => {
        if (valid) {
          this.addGroupDialogVisible = false
          this.treeData[0].children.push({ 'label': this.addGroupForm.name })
          // api.addNode(this.nodeForm).then(response => {
          //   this.getAllVmData()
          //   this.$message({
          //     type: 'success',
          //     message: '添加成功'
          //   })
          // })
        }
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log(response)
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style lang="scss" scoped>
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

</style>
