import * as React from 'react';
import {Link, withRouter} from 'react-router-dom';
import {DataService} from '../dataServices';
import {RouteComponentProps} from 'react-router';
import {connect} from 'react-redux';
import {SwgStore} from '../store/reducers';
import {Dispatch} from 'redux';
import {AppAction, AppActions} from '../store/app/actions';
import {HttpUser} from 'swg-common/bin/models/http/httpUser';

interface Props extends RouteComponentProps<{}> {
    setJwt: (jwt: string) => void;
    setUser: (user: HttpUser) => void;
}

interface State {
    email: string;
    password: string;
}

class Component extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {
            email: '',
            password: ''
        };
    }

    private login = async e => {
        e.preventDefault();
        try {
            const response = await DataService.login(this.state.email, this.state.password);
            console.log(response);
            this.props.setJwt(response.jwt);
            this.props.setUser(response.user);
            this.props.history.push('/game');
        } catch (ex) {
            alert(ex);
        }
    };

    private updateEmail = async e => this.setState({email: e.target.value});
    private updatePassword = async e => this.setState({password: e.target.value});

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
                    onSubmit={this.login}
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
                    <span>Password</span>
                    <input onChange={this.updatePassword} value={this.state.password} type="password" />
                    <button onSubmit={this.login}>Login</button>
                    <Link to={'/register'}>Register</Link>
                </form>
            </div>
        );
    }
}

export let Home = connect(
    (state: SwgStore) => ({}),
    (dispatch: Dispatch<AppAction>) => ({
        setJwt: (jwt: string) => void dispatch(AppActions.setJWT(jwt)),
        setUser: (user: HttpUser) => void dispatch(AppActions.setUser(user))
    })
)(withRouter(Component));
