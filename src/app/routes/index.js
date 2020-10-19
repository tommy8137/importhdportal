/*
  use plain routes instead!!
 */

export default require('./plain')

// for the improvement of development performance
// if (process.env.NODE_ENV === 'development/server') {
//   const Root = require('containers/Root')
//   const Home = require('containers/Home')
//   const Login = require('containers/Login')
//   const Risk = require('containers/Risk')
//   const NotFound = require('containers/NotFound')
//   const Patient = require('containers/Patient')
//   const Overview = require('containers/Patient/Overview')
//   const Search = require('containers/Patient/Search')
//   const Person = require('containers/Person')
//   const Profile = require('containers/Person/components/Profile')
//   const Copyright = require('containers/Person/components/Copyright')
//   const Admin = require('containers/Admin')
//   const Settings = require('containers/Admin/components/Settings')
//   const About = require('containers/Admin/components/About')
//   const Dashboard = require('containers/Dashboard')
//   const Record = require('containers/Record')
//   const Examination = require('containers/Examination')
// }
  // (
  //   <Route path="/" component={Root}>
  //     <Route component={Home}>
  //       {/*<IndexRedirect to="patient" />*/}
  //       <IndexRedirect to="patient"/>
  //       <Route path="patient" component={Patient}>
  //         <IndexRedirect to="overview" />
  //         <Route path="overview" component={Overview}/>
  //         <Route path="search" component={Search}/>
  //       </Route>
  //       <Route path="risk" component={Risk}/>
  //       <Route path="dashboard" component={Blank}/>
  //       <Route path="record" component={Blank}/>
  //       <Route path="examination" component={Blank}/>
  //       <Route path="profile" component={Person}>
  //         <Route path="copyright" component={Copyright}/>
  //       </Route>
  //       <Route path="admin" component={Admin}>
  //         <IndexRedirect to="settings" />
  //         <Route path="settings" component={Settings}/>
  //         <Route path="about" component={About}/>
  //       </Route>
  //     </Route>
  //     <Route path="login" component={Login}/>
  //     <Route path="*" component={NoMatch}/>
  //   </Route>
  // )
