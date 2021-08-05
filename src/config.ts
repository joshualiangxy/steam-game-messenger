import envvar from './conf/envvar.json';
import local from './conf/local.json';

export default {
  ...envvar,
  ...local
};

