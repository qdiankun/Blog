import React, { Component } from 'react'
import './style/page/common.css'
import { Row, Col, List, Icon, Affix, BackTop, message, Spin, Tag, Input, Pagination  } from 'antd'
import CountUp from 'react-countup'
import LazyLoad from 'react-lazyload';
import 'antd/dist/antd.css';
import Header from './components/Header'
import Author from './components/Author'
import Footer from './components/Footer'
import EasyLike from './components/EasyLike'
import MyInfo from './components/MyInfo'
import servicePath from './config/apiUrl'
import store from './store/index' //redux使用

import marked from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/monokai-sublime.css'

const renderer = new marked.Renderer()
marked.setOptions({
  renderer: renderer,
  gfm: true,//启动类似Github样式的Markdown,填写true或者false
  pedantic: false, //只解析符合Markdown定义的，不修正Markdown的错误。填写true或者false
  sanitize: false,//原始输出，忽略HTML标签，这个作为一个开发人员，一定要写flase
  tables: true,//支持Github形式的表格，必须打开gfm选项
  breaks: true,//支持Github换行符，必须打开gfm选项，填写true或者false
  smartLists: true,//优化列表输出，这个填写ture之后，你的样式会好看很多，所以建议设置成ture
  smartypants: true,
  highlight: function (code) {
    return hljs.highlightAuto(code).value
  }
})

const { Search } = Input

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      getblog:[],
      isLoading: true,

      searchblog:[],
      searchValue:'',

      bottomdata:[], //分页数据
      current:1, //当前页数

      def:store.getState().defstyle,
      drawer:store.getState().drawerstyle,
    }
    store.subscribe(this.storeChange.bind(this)) //订阅Redux的状态
  }
  storeChange(){//引用redux中的值修改当前state
    this.setState({
      def:store.getState().defstyle,
      drawer:store.getState().drawerstyle,
    })
  }
  Routerdata(data) {
    this.props.history.push('/blog/' + data)
  }

  componentWillMount(){
    // document.getElementById('root').scrollIntoView(true);//为ture返回顶部，false为底部
    window.scrollTo(0, 0);  

    document.addEventListener('visibilitychange',function(){
      var isHidden = document.hidden;
      if(isHidden){
      document.title = '404!!!页面丢失(￣▽￣)"';
      
      } else {
      document.title = '嘤嘤嘤，你回来了啊(ಥ _ ಥ)';
        setTimeout(()=>{
          document.title = '首页 | Youngster_yj的个人博客'
        },3000)
      }
      }
      );

    document.title = '首页 | Youngster_yj的个人博客'

    fetch(servicePath.getArticleList+'?name=博客分享', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
  })
      .then(res => res.json())
      .then((data) => {
          // console.log(data)
          data = data.reverse()

          //获取置顶文章并重新排序
          let top = data.filter((item)=>{
            return item.topblog == true 
          })
          let notop = data.filter((item)=>{
            return item.topblog != true 
          })

          //非置顶文章根据日期排序
          var compare = function (obj1, obj2) {
            var val1 = new Date(obj1.showDate);
            var val2 = new Date(obj2.showDate);
            if (val1 < val2) {
                return -1;
            } 
            else if (val1 > val2) {
                return 1;
            } 
            else {
                return 0;
            }            
          }
          notop.sort(compare).reverse()
          //非置顶文章根据日期排序

          let add = notop.reverse()
          top.map((item)=>{
             add.push(item)
          })
          let add2 = add.reverse()
          // console.log(add2) //新的排序

          this.setState({
            getblog:add2,
            isLoading: false,
            searchblog:add2 //缓存搜索数据
          },()=>{
            this.bottombtn(1)
          })
      })
      .catch((error) => {
          message.error('服务器端炸裂' + error)
          setTimeout(() => {
              this.setState({ isLoading: false })
          }, 500)
      });
  }
  searchInput(data){
    
    this.setState({
      searchValue:data.target.value
    })
    let inputdata = data.target.value.toLocaleUpperCase() //转换大写
    if(inputdata.length>0){
      let blogdata = this.state.searchblog
      let regexp = [] //存储匹配到的数据
      blogdata.map((item)=>{

    //  console.log(item) //拼接所有字符串信息
     let allInfo = item.articleTitle+item.introducemd+item.showDate
    //  console.log(allInfo) //拼接后的所有信息

      try {
        var re = new RegExp( inputdata , 'i')//i标志表示忽略大小写
      } catch (error) { //正则错误处理
        message.warning('搜索词出错,请重新输入!')
        inputdata='\\w'
        var re = new RegExp( inputdata , 'i')
        this.setState({
          searchValue:''
        })
      }
      
      if(re.test(allInfo.toLowerCase())){ //转换小写
        regexp.push(item)
      }
      })
      // console.log(regexp)
      this.setState({
        getblog:regexp
      },()=>{
        this.bottombtn(1)
      })
    }
    else{
      this.setState({
        getblog:this.state.searchblog
      },()=>{
        this.bottombtn(1)
      })
    }
    
  }
  bottombtn(e){
    // console.log(e)//当前页数
    let data = this.state.getblog
    // console.log(data.slice((e-1)*10,e*10))
    let bottomdata = data.slice((e-1)*10,e*10)
    this.setState({
      current:e,
      bottomdata:bottomdata
    })
    document.getElementById('root').scrollIntoView(true);//为ture返回顶部，false为底部
  }
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    return (
    <div style={this.state.drawer?{paddingLeft:'256px',overflow:'hidden',transition:'all linear .3s',position:' fixed',width:'170%'}:null}>
     
      <Header />
   
      <BackTop>
      <div className="ant-back-top-inner " ><Icon type="rocket"  style={this.state.def?{color:'lightpink'}:null}/></div>
    </BackTop>
      <Row className='comm-main' type='flex' justify='center' style={{paddingTop:'3.2rem'}}>
        <Col className='comm-left' xs={24} sm={24} md={16} lg={18} xl={14} style={{backgroundColor:'rgba(255,255,255,.4)'}}>
        <Spin tip='加载中...' spinning={this.state.isLoading}>
          <List
            header={<Row><Col xs={12} sm={14} md={15} lg={17} xl={17}><div style={{ fontWeight: 'bold', paddingLeft: 20 ,lineHeight: '32px'}}>博客日志 <span style={{color: 'red'}}>{this.state.getblog.length}</span> 篇</div></Col>
                         <Col xs={11} sm={9} md={8} lg={6} xl={6}><Search value={this.state.searchValue} placeholder="搜索首页内容" onChange={(e)=>{this.searchInput(e)}} /></Col>
                         <Col xs={1} sm={1} md={1} lg={1} xl={1}></Col></Row> }
            itemLayout='vertical'//
            dataSource={this.state.bottomdata}
            renderItem={(item,index) => {
              const html1 = marked(item.introducemd) //let html=marked(mdcontent) 的方式转换md 内容为html 并进行渲染
              // console.log(item.articleTitle)
              return (
                <List.Item key={index} className='cssnicehover'>

                  <LazyLoad height={200} offset={-200}>
                    <div className={window.screen.width>=770?'cssnice1':'cssnice'}>

                  <div className='list-title'><a style={this.state.def?{color:'deeppink'}:null}><span onClick={() => {this.Routerdata(item.articleTitle) }}>{item.articleTitle}</span></a></div>
                  <div className='list-icon'>
                    {
                      item.topblog?<span><Tag color="red" style={{margin:0}}>置顶</Tag></span>:null
                    }
                    <span><Icon type='calendar' style={{color:'lightseagreen'}}/> {item.showDate}</span>
                    <span><Icon type='login' style={{color:'sandybrown'}}/> {item.sourceType==undefined?'博客分享':item.sourceType}</span>
                    <span><Icon type='fire' style={{color:'red'}}/> {item.fire?<CountUp start={0} end={item.fire} duration={2} style={{padding:'0px'}}/>:'暂无浏览'}</span>
                  </div>
                  <div className='list-context' dangerouslySetInnerHTML={{ __html: html1 }}></div>
                  <div className='details' style={{ textAlign: 'right', marginRight: 20, fontSize: 15, color: '#1e90ff',position: 'relative' }}>
                    {item.isenter||item.isenter==undefined?null: <Tag color="#87d068" style={{margin:0,left: '.5rem',position: 'absolute'}} onClick={()=>{message.warning('请登陆后访问')}}>文章加密</Tag>}
                    <a onClick={() => { this.Routerdata(item.articleTitle) }}><Icon type="arrows-alt" style={{ marginRight: 10 }} /><span>查看全文 》</span></a>
                  </div>

                     </div>
                  </LazyLoad>

                </List.Item>
              )
            }
            }
          />
          { //为了懒加载
            this.state.bottomdata.length>0?          
          <LazyLoad height={200} offset={-10}>
          <Pagination showQuickJumper defaultCurrent={1} total={this.state.getblog.length} onChange={(e)=>{this.bottombtn(e)}} 
          className='cssnice3' current={this.state.current} style={{textAlign: 'center',padding:'.5rem 0 .5rem'}}/>
          </LazyLoad>:null
          }
          

          </Spin>
        </Col>
        <Col className='comm-right' xs={0} sm={0} md={7} lg={5} xl={4}>
        <Author gotoadmin={this.props.history}/>
        <EasyLike/>
        <MyInfo/>
        </Col>
      </Row>
      <Footer />

    </div>
    );
  }
}

export default App;
