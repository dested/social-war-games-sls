import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {Link, withRouter} from 'react-router-dom';
import {DataService} from '../dataServices';
import {MainStoreName, MainStoreProps} from '../store/main/store';

interface Props extends RouteComponentProps<{}>, MainStoreProps {}

interface State {
  email: string;
  userName: string;
  password: string;
}

@inject(MainStoreName)
@observer
class Component extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      email: '',
      userName: '',
      password: '',
    };
  }

  private register = async (e: any) => {
    e.preventDefault();
    if (!this.state.email || !this.state.userName || !this.state.password) {
      return;
    }
    try {
      const response = await DataService.register(this.state.email, this.state.userName, this.state.password);
      this.props.mainStore.setJwt(response.jwt);
      this.props.mainStore.setUser(response.user);
      this.props.history.push('/');
    } catch (ex) {
      alert(ex);
    }
  };

  private updateEmail = async (e: any) => this.setState({email: e.target.value});
  private updateUserName = async (e: any) => this.setState({userName: e.target.value});
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
          onSubmit={this.register}
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
          <span>Username</span>
          <input onChange={this.updateUserName} value={this.state.userName} />
          <span>Password</span>
          <input onChange={this.updatePassword} value={this.state.password} type="password" />
          <button onSubmit={this.register}>Register</button>
          <Link to={'/'}>Login</Link>
        </form>
      </div>
    );
  }
}

export let Register = withRouter(Component);
