import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {Link, withRouter} from 'react-router-dom';
import {DataService} from '../dataServices';
import {MainStoreName, MainStoreProps} from '../store/main/store';

interface Props extends RouteComponentProps<{}>, MainStoreProps {}

interface State {
  email: string;
  password: string;
  loading: boolean;
}

@inject(MainStoreName)
@observer
class Component extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      email: '',
      password: '',
      loading: false,
    };
  }

  private login = async (e: any) => {
    this.setState({loading: true});
    e.preventDefault();
    try {
      const response = await DataService.login(this.state.email, this.state.password);
      localStorage.setItem('jwt', response.jwt);
      localStorage.setItem('user', JSON.stringify(response.user));
      this.props.mainStore.setJwt(response.jwt);
      this.props.mainStore.setUser(response.user);
      this.props.history.push('/games');
    } catch (ex) {
      alert(ex);
    }
    this.setState({loading: false});
  };

  private updateEmail = async (e: any) => this.setState({email: e.target.value});
  private updatePassword = async (e: any) => this.setState({password: e.target.value});

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <form
          onSubmit={this.login}
          style={{
            padding: 20,
            display: 'flex',
            background: 'rgba(255,255,255,.2)',
            borderRadius: 10,
            flexDirection: 'column',
            width: '40vw',
            height: '40vh',
            justifyContent: 'center',
          }}
        >
          <span>Email</span>
          <input onChange={this.updateEmail} value={this.state.email} type="email" />
          <span>Password</span>
          <input onChange={this.updatePassword} value={this.state.password} type="password" />
          {this.state.loading ? 'Loading' : <button onSubmit={this.login}>Login</button>}
          <Link to={'/register'}>Register</Link>
        </form>
      </div>
    );
  }
}

export let Login = withRouter(Component);
