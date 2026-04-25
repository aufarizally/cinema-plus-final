import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Grid } from '@material-ui/core';
import { IconButton } from '@material-ui/core';
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import LoginForm from './components/LoginForm';

// 1. Import Google Login
import { GoogleLogin } from '@react-oauth/google';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.default,
    height: '100vh'
  },
  grid: {
    height: '100%'
  },
  bgWrapper: {
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  bg: {
    backgroundColor: theme.palette.common.neutral,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: 'url(https://source.unsplash.com/featured/?cinema)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    opacity: 0.5
  },
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  contentBody: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column', // Ubah ke column supaya tombol Google ada di bawah form
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center'
    }
  },
  // Style tambahan untuk pembungkus tombol Google
  googleWrapper: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  }
});

class Login extends Component {
  handleBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  // 2. Fungsi handle untuk Google
  handleGoogleSuccess = (credentialResponse) => {
    console.log("Token Google Berhasil Didapat:", credentialResponse.credential);
    // Nanti kita akan buat logic kirim ke Backend di sini
  };

  handleGoogleError = () => {
    console.log("Login Google Gagal");
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid className={classes.grid} container>
          <Grid className={classes.bgWrapper} item lg={5}>
            <div className={classes.bg} />
          </Grid>
          <Grid className={classes.content} item lg={7} xs={12}>
            <div className={classes.contentHeader}>
              <IconButton
                className={classes.backButton}
                onClick={this.handleBack}>
                <ArrowBackIcon />
              </IconButton>
            </div>
            <div className={classes.contentBody}>
              {/* Form Login Biasa */}
              <LoginForm redirect />

              {/* 3. Tombol Google Login */}
              <div className={classes.googleWrapper}>
                <p style={{ color: '#666', fontSize: '14px' }}>Atau masuk lebih cepat:</p>
                <GoogleLogin
                  onSuccess={this.handleGoogleSuccess}
                  onError={this.handleGoogleError}
                  theme="filled_blue"
                  shape="pill"
                />
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Login.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(Login);