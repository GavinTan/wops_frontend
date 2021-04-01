<template>
  <div class="app-container">
    <el-table
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        label="序号"
        width="180"
      />
      <el-table-column
        prop="cloud"
        label="云平台"
        width="180"
      />
      <el-table-column
        prop="user"
        label="账号"
      />
      <el-table-column
        prop="url"
        label="URL"
      />
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'Cloud',
  data() {
    return {
      tableData: [{
        id: 1,
        cloud: '华为云',
        user: 'abc',
        url: 'https://baiud.com'
      }, {
        id: 2,
        cloud: '华为云',
        user: 'abb',
        url: 'https://baiud.com'
      }, {
        id: 3,
        cloud: '华为云',
        user: 'ddd',
        url: 'https://baiud.com'
      }, {
        id: 4,
        cloud: '华为云',
        user: 'fff',
        url: 'https://baiud.com'
      }]
    }
  }
}
</script>

<style scoped>

</style>
