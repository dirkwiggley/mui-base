import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography, Link as Muilink } from "@mui/material";
import { styled } from '@mui/material/styles';
import { useAuthContext } from "./AuthStore";

const StyledPaper = styled(Paper)(({ theme }) => ({
  justifyContent: "center",
  minHeight: "20vh",
  padding: "50px",
  backgroundColor: "background.scissors",
}));

const Profile = () => {
  const [auth, setAuth] = useAuthContext();

  const [login, setLogin] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [roles, setRoles] = useState<string[] | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  let navigate = useNavigate();

  useEffect(() => {
    if (!auth) {
      navigate("/login/true");
    }
  }, [auth, navigate]);

  useEffect(() => {
    if (auth) {
      try {
        let isAdmin = roles ? roles.includes("ADMIN") : null;
        setLogin(auth.login);
        setRoles(auth.roles);
        setIsAdmin(isAdmin);
        setNickname(auth?.nickname);
        setEmail(auth?.email);
      } catch (err) {
        console.error(err);
        setRoles([]);
        setIsAdmin(false);
      }
    }
  }, [auth, setRoles, setIsAdmin]);

  const getRoles = () => {
    return roles ? JSON.stringify(roles) : "none";
  }

  const handleSubmit = () => {

  }

  return (
    <Grid container spacing={0} justifyContent="center" direction="row">
      <Grid item >
        <Grid container direction="column" justifyContent="center" spacing={2} sx={{
          justifyContent: "center",
          minHeight: "90vh"
        }} >
          <StyledPaper variant="elevation" elevation={2} sx={{ bgcolor: "background.lightestBlue" }}>
            <Grid item>
              <Typography component="h1" variant="h5">Profile</Typography>
            </Grid>
            <Grid item>
              <form onSubmit={handleSubmit}>
                <Grid container direction="column" spacing={2}>
                  <Grid item>
                    <Typography sx={{ mt: 2 }}>Login: {login}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>Nickname: {nickname}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>Email: {email}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>Roles: {getRoles()}</Typography>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </StyledPaper >
        </Grid >
      </Grid >
    </Grid >);
}

export default Profile;