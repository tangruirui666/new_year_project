<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button type="primary" @click="adddialogVisible = true"
      >添加角色</el-button
    >
    <el-table :data="rolesList" border stripe>
      <el-table-column type="expand">
        <!-- 通过插槽渲染权限 -->
        <template slot-scope="scope">
          <!-- 为每一行添加下划线分隔开，采用class绑定方法 -->
          <el-row
            v-for="(item1, i1) in scope.row.children"
            :key="item1.id"
            :class="['bd-bottom', i1 === 0 ? 'bd-top' : '', 'center']"
            closable
            @close="deleteRight(scope.row, item1.id)"
          >
            <!-- 一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="deleteRight(scope.row, item1.id)">{{
                item1.authName
              }}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 二级和三级权限 -->
            <el-col :span="19">
              <el-row
                v-for="(item2, i2) in item1.children"
                :key="item2.id"
                :class="[i2 === 0 ? '' : 'bd-top', 'center']"
              >
                <!-- 二级权限 -->
                <el-col :span="6">
                  <el-tag
                    type="success"
                    closable
                    @close="deleteRight(scope.row, item2.id)"
                    >{{ item2.authName }}</el-tag
                  >
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 三级权限 -->
                <el-col :span="18">
                  <el-tag
                    type="warning"
                    v-for="item3 in item2.children"
                    :key="item3.id"
                    closable
                    @close="deleteRight(scope.row, item3.id)"
                    >{{ item3.authName }}</el-tag
                  >
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index">#</el-table-column>
      <el-table-column prop="roleName" label="角色名称"></el-table-column>
      <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-search"
            type="primary"
            @click="updatateRole(scope.row.id)"
            >编辑</el-button
          >
          <el-button
            icon="el-icon-delete"
            type="danger"
            @click="deleteRole(scope.row)"
            >删除</el-button
          >
          <el-button
            icon="el-icon-setting"
            type="waringing"
            @click="setDialog(scope.row)"
            >分配权限</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setdialogVisible"
      width="30%"
      @close="setDialogClose"
    >
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="rightcheck"
        ref="refDialog"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDialogClose">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色弹窗 -->
    <el-dialog title="添加" :visible.sync="adddialogVisible" width="30%">
      <el-form label-width="70px" :model="addRoleForm">
        <el-form-item label="用户角色">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="用户描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取消</el-button>
        <el-button @click="addRole">确定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色弹窗 -->
    <el-dialog title="编辑" :visible.sync="updateDialogVisible" width="30%">
      <el-form>
        <el-form-item label="用户角色">
          <el-input v-model="saveForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="用户描述">
          <el-input v-model="saveForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button @click="changeRole()">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      setdialogVisible: false,
      //所有权限的数据
      rightList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //默认勾选的权限的数组
      rightcheck: [],
      roleid: [],
      //添加弹窗
      adddialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      saveForm: {},
      updateDialogVisible: false
    }
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data
    },
    async deleteRight(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // console.log(confirmResult)
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除权限成功')
      role.children = res.data
    },

    async setDialog(role) {
      this.roleid = role.id
      //所有权限列表接口
      const { data: res } = await this.$http.get('rights/tree')
      // console.log(res)
      this.rightList = res.data
      this.getRightCheck(role, this.rightcheck)
      this.setdialogVisible = true
    },
    //通过递归的方法，获取角色下所有三级权限的id,并保存在arr中
    getRightCheck(node, arr) {
      //如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getRightCheck(item, arr))
    },
    //监听分配权限对话框的关闭事件
    setDialogClose() {
      this.rightcheck = []
    },
    //点击确定按钮,关闭弹窗并且保存checked的所有的项
    async confirmDialogClose() {
      //getCheckedKeys若节点可被选择（即 show-checkbox 为 true），
      //则返回目前被选中的节点的 key 所组成的数组
      //若节点可被选择（即 show-checkbox 为 true），
      //则返回目前半选中的节点所组成的数组
      const allKey = [
        ...this.$refs.refDialog.getCheckedKeys(),
        ...this.$refs.refDialog.getHalfCheckedKeys()
      ]
      const idStr = allKey.join(',')
      // console.log(idStr)
      const { data: res } = await this.$http.post(
        `roles/${this.roleid}/rights`,
        {
          rids: idStr
        }
      )
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.getRolesList()
      this.setdialogVisible = false
    },
    //添加角色
    async addRole() {
      const { data: res } = await this.$http.post(`roles`, this.addRoleForm)
      // console.log(res)
      if (res.meta.status !== 201) return this.$message.error('添加失败')
      this.$message.success('添加成功')
      this.getRolesList()
      this.adddialogVisible = false
    },
    //删除角色
    async deleteRole(roleId) {
      // console.log(roleId)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`roles/${roleId.id}`)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getRolesList()
    },
    //根据id查询角色
    async updatateRole(id) {
      const { data: res } = await this.$http.get(`roles/` + id)
      this.saveForm = res.data
      this.updateDialogVisible = true
    },
    async changeRole() {
      const { data: res } = await this.$http.put('roles/' + this.saveForm.roleId, {
        roleName: this.saveForm.roleName,
        roleDesc: this.saveForm.roleDesc
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('编辑失败')
      this.$message.success('编辑成功')
      this.getRolesList()
      this.updateDialogVisible = false
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>

<style scoped lang="less">
.el-row {
  margin: 7px;
}
// 添加上划线分割线
.bd-top {
  border-top: 1px solid #eee;
}
//添加下划线分割线
.bd-bottom {
  border-bottom: 1px solid #eee;
}
//一级二级权限上下居中
.center {
  display: flex;
  align-items: center;
}
</style>
