import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FormControl,
  Box,
  Paper,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Select,
  MenuItem,
  Stack,
  InputLabel,
  Typography,
  SelectChangeEvent
} from "@mui/material";
import { styled } from '@mui/material/styles';

import { useAuthContext, UserInfo } from "./AuthStore";
import { getUsers, getUser, getRoles, RoleType, updateUser, initRefreshTokens } from '../api';

const PAPER_COLOR = "#99d6ff";
const LIGHT_PAPER_COLOR = "#a8e6f0";

const StackItem = styled(Box)(({ theme }) => ({
  // backgroundColor: PAPER_COLOR,
  selected: PAPER_COLOR,
  padding: theme.spacing(1),
  textAlign: 'left',
  or: theme.palette.text.secondary,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: PAPER_COLOR,
  width: '90%',
  justify: 'center',
  textAlign: 'center'
}));

const Users = () => {
  const [auth, setAuth] = useAuthContext();
  const [users, setUsers] = useState<JSX.Element[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [roles, setRoles] = useState<string[] | null>(null);
  const [active, setActive] = useState<boolean>(false);
  const [resetpwd, setResetpwd] = useState<boolean>(false);
  const [rolesList, setRolesList] = useState<string[] | null>(null);

  let navigate = useNavigate();

  useEffect(() => {
    if (!auth) {
      navigate("/home");
    }
    const admin = auth ? auth.roles.includes('ADMIN') : false;
    if (!admin) {
      navigate("/home");
    } else {
      if (auth) {
        setUserId(auth.id.toString());
        setLogin(auth.login);
        setNickname(auth.nickname);
        setEmail(auth.email);
        setRoles(auth.roles);
        setActive(auth.active);
        setResetpwd(auth.resetpwd);
      }
    }

    getRoles().then(response => {
      const newRoles: string[] = [];
      response.forEach(element => {
        newRoles.push(element.name);
      });
      if (newRoles.length > 1) {
        setRolesList(newRoles);
      } else {
        setRolesList(null);
      }
    }).catch(err => {
      console.error(err);
    });

    getUsers().then(response => {
      const newUsers: JSX.Element[] = [];
      response.forEach(element => {
        const elem = <MenuItem key={element.id} value={element.id}>{element.login}({element.nickname})</MenuItem>;
        newUsers.push(elem);
      });
      if (admin) {
        newUsers.push(<MenuItem key="add" value="add">Add a user</MenuItem>);
      }
      setUsers(newUsers);
    }).catch(err => {
      console.error(err);
    });
  }, [auth, navigate]);

  useEffect(() => {
    if (!auth) {
      navigate("/login/true");
    }
  }, [auth, navigate]);

  const isAdmin = () => {
    return auth ? auth.roles.includes('ADMIN') : false;
  }

  const getUsersAndUpdateSelect = () => {
    getUsers().then(response => {
      const newUsers = [];
      response.forEach(element => {
        newUsers.push(<MenuItem key={element.id} value={element.id}>{element.login}({element.nickname})</MenuItem>);
      });
      if (isAdmin()) {
        newUsers.push(<MenuItem key="add" value="add">Add a user</MenuItem>);
      }
      setUsers(newUsers);
    }).catch(err => {
      console.error(err);
    });
  }

  const resetUser = (id = "") => {
    setUserId(id);
    setLogin("");
    setNickname("");
    setEmail("");
    setRoles(null);
    setActive(false);
    setResetpwd(false);
  }

  const handleSelectUser = (event: SelectChangeEvent<unknown>) => {
    const selectedId: string = event.target.value as string;
    setUserId(selectedId);
    if (selectedId === "add") {
      resetUser("add");
    } else {
      getUser(Number(selectedId))
        .then(response => {
          setLogin(response.login);
          setNickname(response.nickname);
          setEmail(response.email);
          setRoles(response.roles);
          setActive(response.active);
          setResetpwd(response.resetpwd);
        }).catch(err => {
          alert("Error handling incomplete");
          resetUser();
        });
    }
  }

  const handleActive = () => {
    setActive(!active);
  }

  const handleResetpwd = () => {
    setResetpwd(!resetpwd);
  }

  const handleChangeRoles = (role: string) => {
    let filtered: string[] = [];
    let newRoles: string[] = [];
    if (roles) {
      newRoles = [...roles];
    }
    if (newRoles.includes(role)) {
      newRoles.forEach(element => {
        if (element !== role) {
          filtered.push(element)
        }
      });
      setRoles(filtered);
    } else {
      filtered = [...newRoles];
      filtered.push(role);
      setRoles(filtered);
    }
  }

  const handleUpdate = () => {
    const newRoles: string[] = roles ? roles : [];
    let userInfo: UserInfo = {
      id: Number(userId),
      login: login,
      nickname: nickname,
      email: email,
      roles: newRoles,
      active: active,
      resetpwd: resetpwd,
    }
    updateUser(userInfo)
      .then(result => {
        // TODO: replace with snackbar
        alert("Success");
        if (userInfo.id === auth?.id) {
          setAuth(userInfo);
        };
        getUsersAndUpdateSelect();
      }).catch(err => {
        alert(err);
      });
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, elementName: string) => {
    // let element: HTMLElement | null = document.getElementById(elementName);
    // let value = element?.value;
    let value = event.target.value;
    if (elementName === "loginInput") {
      setLogin(value);
      getUsersAndUpdateSelect();
    } else if (elementName === "nicknameInput") {
      setNickname(value);
      getUsersAndUpdateSelect();
    } else if (elementName === "emailInput") {
      setEmail(value);
    } else {
      alert("Invalid document element");
    }
  }

  const deleteRefeshTokens = () => {
    initRefreshTokens();
  }
  
  const getLoginInput = () => {
    if (userId === "add") {
      return (
        <TextField
          id="loginInput"
          label="Login"
          InputLabelProps={{ shrink: true }}
          autoComplete="off"
          value={login}
          onChange={(evt) => handleInputChange(evt, "loginInput")} />
      );
    } else {
      return (
        <TextField id="loginInput" variant="filled" value={login} label="Login"></TextField>
      );
    }
  };

  const isCheckedRole = (option: string) : boolean => {
    if (!jsRoles) {
      return true;
    } else if (jsRoles.includes(option)) {
      return true;
    } 
    return false;
  }

  let jsRolesList: string[] = [];
  if (rolesList) {
    jsRolesList = rolesList;
  }
  let jsRoles: string[] = [];
  if (roles) {
    jsRoles = roles;
  }

  return (
    <Box
      display="flex"
      justifyContent="Center"
      sx={{
        width: '90%',
        mt: 2
      }}>
      <StyledPaper square={false} >
        <Stack spacing={1}>
          <StackItem><h3>Edit User</h3></StackItem>
          <StackItem>
            <FormControl variant="filled" fullWidth>
              <InputLabel id="select-label">User</InputLabel>
              <Select
                labelId="select-label"
                id="select-user"
                value={users?.length > 0 ? userId : ""}
                onChange={(evt) => handleSelectUser(evt)}
              >
                {users}
              </Select>
            </FormControl>
          </StackItem>
          <StackItem>
            <FormControl variant="filled" fullWidth>
              {getLoginInput()}
            </FormControl>
          </StackItem>
          <StackItem>
            <FormControl variant="filled" fullWidth>
              <TextField
                id="nicknameInput"
                label="Nickname"
                InputLabelProps={{ shrink: true }}
                autoComplete="off"
                value={nickname}
                onChange={(evt) => handleInputChange(evt, "nicknameInput")} />
            </FormControl>
          </StackItem>
          <StackItem>
            <FormControl variant="filled" fullWidth>
              <TextField
                id="emailInput"
                label="Email"
                InputLabelProps={{ shrink: true }}
                autoComplete="off"
                value={email}
                onChange={(evt) => handleInputChange(evt, "emailInput")} />
            </FormControl>
          </StackItem>
          <StackItem>
            <StyledPaper sx={{ backgroundColor: LIGHT_PAPER_COLOR, width: "100%" }}>
              <Typography sx={{ display: "flex", ml: 2, pt: 2 }} >
                Roles
              </Typography>
              <FormControl sx={{ width: "100%", ml: 2 }}>
                {jsRolesList.map((option) => (
                  <FormGroup key={option}>
                    {/* Is this option in the users roles? */}
                    <FormControlLabel control={<Checkbox checked={isCheckedRole(option)} />} label={option} onChange={() => handleChangeRoles(option)} />
                  </FormGroup>
                ))}
              </FormControl>
            </StyledPaper>
          </StackItem>
          <StackItem>
            <StyledPaper sx={{ backgroundColor: "#a8e6f0", width: "100%" }}>
              <Stack>
                <StackItem>
                  <Typography sx={{ p: 0, ml: 1 }}>
                    Misc
                  </Typography>
                </StackItem>
                <StackItem>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox id="active" checked={active} onClick={handleActive} sx={{ p: 0, ml: 2 }} />} label="Active" />
                  </FormGroup>
                </StackItem>
                <StackItem>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox id="resetpassword" checked={resetpwd} onClick={handleResetpwd} sx={{ p: 0, ml: 2 }} />} label="Reset Password" />
                  </FormGroup>
                </StackItem>
              </Stack>
            </StyledPaper>
          </StackItem>
          <StackItem>
            <Button variant="contained" onClick={handleUpdate}>Update</Button>
            { isAdmin() ? (<Button variant="contained" onClick={deleteRefeshTokens}>Delete Refresh Tokens</Button>) : null }
          </StackItem>
        </Stack>
      </StyledPaper>
    </Box>
  );
}

export default Users;