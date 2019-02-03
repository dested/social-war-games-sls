import {HttpUser} from '@swg-common/models/http/httpUser';
import {action, observable} from 'mobx';

export class MainStore {
  @observable jwt?: string;
  @observable user?: HttpUser;

  @action setJwt(jwt: string) {
    this.jwt = jwt;
  }
  @action setUser(user: HttpUser) {
    this.user = user;
  }
  @action logout() {
    this.jwt = null;
    this.user = null;
  }
}

export const mainStore = new MainStore();
export type MainStoreProps = {mainStore?: MainStore};
export const MainStoreName = 'mainStore';
{
  const jwt = localStorage.getItem('jwt');
  const user = localStorage.getItem('user');
  if (jwt && user) {
    mainStore.setJwt(jwt);
    mainStore.setUser(JSON.parse(user));
  }
}
