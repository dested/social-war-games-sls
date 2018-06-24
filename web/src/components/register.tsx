import {HttpUser} from '@swg-common/models/http/httpUser';
import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps} from 'react-router';
import {Link, withRouter} from 'react-router-dom';
import {DataService} from '../dataServices';
import {Dispatcher} from '../store/actions';
import {AppActions} from '../store/app/actions';
import {SwgStore} from '../store/reducers';

interface Props extends RouteComponentProps<{}> {
    setJwt: (jwt: string) => void;
    setUser: (user: HttpUser) => void;
}

interface State {
    email: string;
    userName: string;
    password: string;
}

class Component extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {
            email: '',
            userName: '',
            password: ''
        };
    }

    private register = async (e: any) => {
        e.preventDefault();
        if (!this.state.email || !this.state.userName || !this.state.password) { return; }
        try {
            const response = await DataService.register(this.state.email, this.state.userName, this.state.password);
            this.props.setJwt(response.jwt);
            this.props.setUser(response.user);
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
                    alignItems: 'center'
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
                        justifyContent: 'center'
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

export let Register = connect(
    (state: SwgStore) => ({}),
    (dispatch: Dispatcher) => ({
        setJwt: (jwt: string) => void dispatch(AppActions.setJWT(jwt)),
        setUser: (user: HttpUser) => void dispatch(AppActions.setUser(user))
    })
)(withRouter(Component));
