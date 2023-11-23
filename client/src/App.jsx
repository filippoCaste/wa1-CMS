import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'

import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Container, Form, Navbar } from 'react-bootstrap';
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { doLogin, doLogout, editWebname, getAllPages, getPublishedPages, getWebName } from './API';
import UserContext from './UserContext';
import { PageNotFound } from './components/PageNotFound';
import { LoginForm } from './components/Login';
import PageList from './components/PageList';
import { PageInfo } from './components/PageContent';
import { CreatePage } from './components/CreatePage';
import { EditPage } from './components/EditPage';
import dayjs from 'dayjs';

function App() {

  const [user, setUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [pages, setPages] = useState([]);
  const [frontOffice, setFrontOffice] = useState(true);

  const [show, setShow] = useState(false);
  const [errMsg, setErrMsg] = useState('')
  const [webName, setWebName] = useState('')

  // --------------------------------------------------------------------------------------
  //                                 login/logout
  // --------------------------------------------------------------------------------------
  const handleLogin = async (username, password) => {
    try {
      const user = await doLogin(username, password);
      setUser(user);
      setLoggedIn(true);
      setFrontOffice(false);
    } catch (err) {
      // error is handled and visualized in the login form
      throw err;
    }
  };

  const handleLogout = async () => {
    await doLogout();
    setLoggedIn(false);
    setUser({});
  };

  // --------------------------------------------------------------------------------------
  //                                     effect
  // --------------------------------------------------------------------------------------
  
  // called each time a user logs in or out
  useEffect(() => {
    // load published pages from the server
    if(loggedIn) { 
        getAllPages()
          .then((pp) => {
              setPages(pp);
          })
          .catch(err => setErrMsg(err.message))
    } else {
      getPublishedPages()
        .then((pp) => {
            setPages(pp);
        })
        .catch(err => setErrMsg(err.message))
    }
  }, [user]);

  useEffect(() => {
    getWebName()
      .then((res) => setWebName(res))
      .catch(err => setErrMsg(err.message))
  }, [])

  // --------------------------------------------------------------------------------------
  //                                    
  // --------------------------------------------------------------------------------------


  return <UserContext.Provider value={user}> 
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout errMsg={errMsg} show={show} setShow={setShow} handleLogout={handleLogout} frontOffice={frontOffice} setFrontOffice={setFrontOffice} setPages={setPages} webName={webName} setWebName={setWebName} />}>
          <Route index element={<PageList frontOffice={frontOffice} loggedIn={loggedIn} user={user} pages={pages} setPages={setPages} />} />
          <Route path='/login' element={<LoginForm handleLogin={handleLogin} />} />
          <Route path='/yourpages'
            element={<PageList pages={pages.filter(p => p.authorID === user.id)} frontOffice={frontOffice} loggedIn={loggedIn} user={user} />} />
          <Route path='/front-office'
            element={<PageList pages={pages.filter(p => dayjs(p.publicationDate).isBefore(dayjs()))} frontOffice={frontOffice} loggedIn={loggedIn} user={user} />} />
          <Route path='/pages/:pageId'
            element={<PageInfo pages={pages} user={user} frontOffice={frontOffice} setPages={setPages} />} />
          <Route path='/pages/newpage'
            element={loggedIn ? <CreatePage setPages={setPages} /> : <Navigate replace to='/' />} />
          <Route path='/pages/editpage/:pageId'
            element={loggedIn ? <EditPage pages={pages} user={user} setPages={setPages} /> : <Navigate replace to='/' />} />

          <Route path='*' element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </UserContext.Provider>;
}

function MainLayout(props) {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const travelToFrontOffice = () => {
    props.setFrontOffice(!props.frontOffice);
    getAllPages().then((result) => {
      props.setPages(result)
    })

  }

  const changeWebName = () => {
    editWebname(props.webName)
      .then() 
      .catch(e => props.setErrMsg(e.message))
  }

  const refreshPages = () => {
    // in case of changes of other users
    getAllPages().then((result) => {
      props.setPages(result)
    })

  }

  return <>
    <header>
      <Navbar sticky="top" variant='dark' bg="primary" expand="lg" className='mb-3'>
        <Container>
          {user.role === 'admin' ? 
          <Form>
              <Form.Control value={props.webName} onChange={(ev) => { props.setWebName(ev.target.value) }} type="text" name="text" />
              <Button onClick={changeWebName}> <i className="bi bi-check-circle-fill"></i> </Button>
          </Form>
          :
          <Navbar.Brand><Link to='/' style={{ color: 'white', textDecoration: 'none' }}>{props.webName}</Link> </Navbar.Brand>
        }
          {user.id && !props.frontOffice && <Navbar.Text><Link to='/' onClick={refreshPages}>All pages</Link></Navbar.Text>}
          {user.id && !props.frontOffice && <Navbar.Text><Link to='/yourpages' onClick={refreshPages}>Your pages</Link></Navbar.Text>}
          {user.id && !props.frontOffice && <Navbar.Text><Link to='/front-office' onClick={travelToFrontOffice}>{"Front-Office"}</Link></Navbar.Text>}
          {user.id && props.frontOffice && <Navbar.Text><Link to='/' onClick={travelToFrontOffice}>{"Back-Office"}</Link></Navbar.Text>}
          {user.id && !props.frontOffice && <Navbar.Text><Link to='/pages/newpage'>Create page</Link></Navbar.Text>}
          <Navbar.Text>
            {user.id ? <span>{user.email} <br /> <Link to='/'><Button variant='danger' onClick={props.handleLogout}>Logout</Button></Link> </span> : <Button variant='primary' onClick={() => navigate('/login')}>Login</Button>}
          </Navbar.Text>
        </Container>
      </Navbar>
    </header>
    <main>
      <Container>
        <Alert
          dismissible
          show={props.show}
          onClose={() => props.setShow(false)}
          variant="danger">
          {props.errMsg}
        </Alert>
        <Outlet />
      </Container>
    </main>

  </>
}

export default App
