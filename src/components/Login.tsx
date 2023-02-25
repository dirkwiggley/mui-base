import { useRef, useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/system';
import { Grid, Paper, Typography, TextField, Button, Link as Muilink } from "@mui/material";
import API from '../api';
import { useAuthContext, UserInfo, instanceofUserInfo, convertToUserInfo, defaultUserInfo } from './AuthStore';

const StyledGrid = styled(Grid, {
  name: "StyledGrid",
  slot: "Wrapper"
})({
  justifyContent: "center",
  minHeight: "90vh",
});

const StyledPaper = styled(Paper, {
  name: "StyledPaper",
  slot: "Wrapper"
})({
  justifyContent: "center",
  minHeight: "30vh",
  padding: "50px",
});

const ErrMsgTypography = styled(Typography, {
  name: "ErrMsgTypoghraphy",
  slot: "Wrapper"
})({
  color: "red",
  fontSize: "20",
  fontWeight: "600",
});

const OffscreenTypography = styled(Typography, {
  name: "OffscreenTypography",
  slot: "Wrapper"
})({
    display: "none"
});

function Login() {  
  const [ auth, setAuth ] = useAuthContext();

  const { showLogin } = useParams(); 

  const userRef = useRef(null);
  const errRef = useRef(null);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [show, setShow] = useState<boolean>(showLogin === "true");

  let navigate = useNavigate();

  useEffect(() => {
    const loginElement = document.getElementById("login");
    loginElement?.focus();
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [login, password]);

  const changeLogin = (event: ChangeEvent<HTMLInputElement>) => {
    setLogin(event.target.value);
    setErrMsg("");
  }

  const changePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setErrMsg("");
  }

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    API.loginApi(login, password)
      .then(response => {
        // Set Context
        let resp: UserInfo | null = null;
        if (instanceofUserInfo(response)) {
          resp = convertToUserInfo(response);
        }
        if (resp?.resetpwd) {
          // We need to keep the userId for the reset
          let defaultUser = defaultUserInfo;
          defaultUser.id = resp.id;
          // We need to invalidate the login data if the user needs to reset their password
          setAuth(defaultUser);
        } else {
          setAuth(resp);
        }
        setLogin('');
        setPassword('');
        setShow(false);
        if (resp?.resetpwd) {
          navigate("/resetpassword"); 
        } else {
          navigate("/home");
        }
      }).catch(err => {
        if (!err?.response) {
          setErrMsg('No Server Response');
        } else if (err.response?.status === 400) {
          setErrMsg('Incorrect Username or Password');
        } else if (err.response?.status === 401) {
          setErrMsg('Unauthorized');
        } else {
          setErrMsg('Login Failed');
        }
      });
  }

  const out = show ?
  (
    <Grid container spacing={0} justifyContent="center" direction="row">
      <Grid item >
        <StyledGrid container direction="column" justifyContent="center" spacing={2} >
          <StyledPaper variant="elevation" elevation={2} sx={{ bgcolor: "background.lightestBlue" }}>
            <Grid item>
              {errMsg === "" ? <OffscreenTypography ref={errRef} aria-live="assertive" /> : <ErrMsgTypography ref={errRef} aria-live="assertive" >{errMsg}</ErrMsgTypography>}
            </Grid>
            <Grid item>
              <Typography component="h1" variant="h5">Sign in</Typography>
            </Grid>
            <Grid item>
              <form onSubmit={handleSubmit}>
                <Grid container direction="column" spacing={2}>
                  <Grid item>
                    <TextField
                      id="login"
                      // ref={userRef}
                      type="login"
                      placeholder="Login"
                      variant="outlined"
                      value={login}
                      onChange={changeLogin}
                      required
                      // />
                      autoFocus={true} />
                  </Grid>
                  <Grid item>
                    <TextField
                      id="pwd"
                      type="password"
                      placeholder="Password"
                      variant="outlined"
                      value={password}
                      onChange={changePassword}
                      required />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      sx={{ width: "100%", bgcolor: "background.darkestBlue" }} >Submit</Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
            <Grid item>
              <Muilink href="#" variant="body2" sx={{ color: "background.darkestBlue" }}>Forgot Password?</Muilink>
            </Grid>
          </StyledPaper >
        </StyledGrid >
      </Grid >
    </Grid > ) :
    null;

  return out
    
}
export default Login;