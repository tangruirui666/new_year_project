<template>
  <el-container class="home_container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 左边区域 -->
      <el-aside :width="isCollapse ? '64px' :'200px'">
        <!-- 菜单折叠效果-->
        <div class="taggle-button" @click="toggle">|||</div>
        <!-- 	router是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转 -->
        <!-- default-active当前激活菜单的 index -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition=false
          router
          :default-active='activepath'
        >
        <!-- 一级菜单 -->
        <!-- index直接写item.id报错,因为只接受字符字符串，后面+''转换成字符串 -->
          <el-submenu :index="item.id +''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <!-- 修改index，实现点击路由链接跳转 -->
            <el-menu-item :index="'/'+subItem.path+''" v-for="subItem in item.children" :key="subItem.id" @click="saveNavIndex('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右边区域 -->
      <el-main>
        <!-- 路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
    data(){
   return {
       //左侧菜单数据获取
       menuList:[],
       iconList:{
           '125':'iconfont icon-user',
           '103':'iconfont icon-tijikongjian',
           '101':'iconfont icon-shangpin',
           '102':'iconfont icon-danju',
           '145':'iconfont icon-baobiao',
       },
       isCollapse:false,
       activepath:''
   }
    },
  created() {
    this.getMenuList()
    this.activepath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      //将token清空
      window.sessionStorage.clear()
      //重定向到登录页
      this.$router.push('./login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if(res.meta.status!==200) return this.$message.error('')
      this.menuList=res.data
    },
    toggle(){
      this.isCollapse=!this.isCollapse;
    },
    //保存链接的激活状态  
    saveNavIndex(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activepath=activePath
    }
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  //两边放置
  justify-content: space-between;
  //将图片距离左边的padding设置为0
  padding-left: 0;
  //使按钮居中
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  //解决侧边栏边框不齐问题
  .el-menu{
      border-right:none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.home_container {
  height: 100%;
}
.iconfont {
    margin-right:10px;
}
.taggle-button{
  background-color: #4A5064;
  cursor: pointer;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  color:#fff;
}
</style>
