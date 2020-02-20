<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 提示 -->
      <el-alert title="消息提示的文案" type="info" center show-icon> </el-alert>
      <!-- 进度条 -->
      <el-steps
        :active="active - 0"
        finish-status="success"
        align-center
        :space="200"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tag标签 -->

      <el-tabs tab-position="left" v-model="active" @tab-click="tabClick">
        <el-tab-pane label="基本信息" name="0">
          <el-form
            :model="ruleForm"
            :rules="rules"
            ref="ruleForm"
            label-width="100px"
          >
            <el-form-item label="商品名称" prop="goods_name">
              <el-input></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="value"
                :options="catListjl"
                :props="propsDefault"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <el-form>
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyList"
              :key="item.attr_id"
            >
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">商品属性</el-tab-pane>
        <el-tab-pane label="商品图片" name="3">商品图片</el-tab-pane>
        <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: '0',
      ruleForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: ''
      },
      rules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      catListjl: [],
      propsDefault: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      value: [],
      manyList: []
    }
  },
  created() {
    this.goodcatList()
  },
  computed: {
    goodid() {
      if (this.value.length === 3) {
        console.log(this.value)
        return this.value[2]
      }
      return null
    }
  },
  methods: {
    //获取级联选择器数据
    async goodcatList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取级联选择器失败')
      }
      this.catListjl = res.data
      console.log(res.data)
    },
    handleChange(value) {
      console.log(value)
    },
    async tabClick() {
      //获取商品参数
      if (this.active === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.goodid}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          console.log(item)
        })

        this.manyList = res.data
        console.log(this.manyList)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
