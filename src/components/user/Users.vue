<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryinfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <!-- 指定了作用域插槽，会覆盖prop,所以不需要 -->
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <!-- 作用域插槽的形式设置操作栏 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              type="primary"
              size="mini"
              @click="editUser(scope.row.id)"
            ></el-button>
            <el-button
              icon="el-icon-delete"
              type="danger"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="角色设置"
              placement="top-end"
              :enterable="false"
            >
              <el-button
                icon="el-icon-setting"
                type="warning"
                size="mini"
                @click="roleSetting(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页部分 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加弹出层 -->
    <!-- close，弹出层关闭时的回调 -->
    <el-dialog
      title="添加表单"
      :visible.sync="dialogVisible"
      width="30%"
      @close="addDialogClose"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addRuleForm"
        label-width="70px"
      >
        <!-- prop为验证时的值 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改弹出层 -->
    <el-dialog title="修改表单" :visible.sync="editdialogVisible" width="30%">
      <el-form
        :model="saveForm"
        :rules="saveFormRule"
        ref="editRuleForm"
        label-width="70px"
        @close="editDialogClose"
      >
        <!-- prop为验证时的值 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="saveForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="saveForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="saveForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 角色分配弹出层 -->
    <el-dialog title="提示" :visible.sync="roleSetdialogVisible" width="30%"
    @close="setDialogClose">
      <span>角色分配</span>
      <div>
        <p>当前的用户:{{ userinfo.username }}</p>
        <p>当前的角色:{{ userinfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select placeholder="请选择活动区域" v-model="selectRoleId">
            <el-option
              :label="item.roleName"
              :value="item.id"
              v-for="item in roleList"
              :key="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleSetdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="rolesave">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //自定义校验规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    //自定义手机校验规则
    var checkPhone = (rule, value, cb) => {
      const regPhone = /^((13[0-9])|(17[0-1,6-8])|(15[^4,\\D])|(18[0-9]))\d{8}$/
      if (regPhone.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      queryinfo: {
        query: '',
        pagenum: 1, //当前页码
        pagesize: 3 //每页显示条数
      },
      userList: [],
      total: 0,
      dialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 9, message: '长度在 2到 9 个字符', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      saveForm: {},
      saveFormRule: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      editdialogVisible: false,
      roleSetdialogVisible: false,
      //需要被分配角色的用户信息
      userinfo: {},
      //所有角色的数据列表
      roleList: [],
      selectRoleId: ''
    }
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryinfo
      })
      // console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取用户列表失败！')
      this.userList = res.data.users
      this.total = res.data.total
    },
    //
    handleSizeChange(size) {
      //  console.log(size)
      this.queryinfo.pagesize = size
      this.getUserList()
    },
    handleCurrentChange(current) {
      // console.log(current)
      this.queryinfo.pagenum = current
      this.getUserList()
    },
    async userStateChange(userinfo) {
      // console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        this.$message.error('设置用户状态失败')
        this.userinfo.mg_state = !this.userinfo.mg_state
      }
      // this.$message.success('更改用户状态成功')
      // console.log(res)
    },

    addDialogClose() {
      this.$refs.addRuleForm.resetFields()
    },
    //关闭弹窗之后进行回调，重置表单
    editDialogClose() {
      this.$refs.editRuleForm.resetFields()
    },
    addUser() {
      //进行表单预校验
      //async位置
      this.$refs.addRuleForm.validate(async valid => {
        console.log(valid)
        if (!valid) return 
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        //隐藏添加用户的对话框
        this.dialogVisible = false
        //重新加载
        this.getUserList()
      })
    },
    async editUser(id) {
      console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      console.log(res)
      this.saveForm = res.data
      if (res.meta.status !== 200)
        return this.$message.error('查询用户信息失败')
      this.editdialogVisible = true
      console.log('000')
      console.log(this.saveForm)
    },
    updateUser() {
      //表单预验证
      this.$refs.editRuleForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'users/' + this.saveForm.id,
          {
            email: this.saveForm.email,
            mobile: this.saveForm.mobile
          }
        )
        if (res.meta.status !== 200) return this.$message.error('更新失败')
        this.editdialogVisible = false
        this.getUserList()
        this.$message.success('更新成功')
      })
    },
    //删除操作id
    async deleteUser(id) {
      //删除之前询问是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除，是否继续',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      ).catch(err => err)
      console.log(confirmResult)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('未删除成功')
      this.$message.success('删除成功')
      this.getUserList()
    },
    //分配角色
    async roleSetting(userinfo) {
      this.userinfo = userinfo
      console.log(this.userinfo)
      const { data: res } = await this.$http.get('roles')
      this.roleList = res.data
      this.roleSetdialogVisible = true
    },
    async rolesave() {
      if (!this.selectRoleId) return this.$message.error('请选择新的角色')
      const { data: res } = await this.$http.put(
        `users/${this.userinfo.id}/role`,
        {
          rid: this.selectRoleId
        }
      )
      if (res.meta.status !== 200) return this.$message.error('分配角色失败')
      this.$message.success('分配角色成功')
      this.getUserList()
      this.roleSetdialogVisible = false
    },
    setDialogClose(){
      this.selectRoleId=""
      this.userinfo=""
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style></style>
