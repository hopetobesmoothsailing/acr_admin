import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Utenti & status  ',
    path: '/user',
    icon: icon('ic_user'),
  },
  {
    title: 'Risultati Radio',
    path: '/acr',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Risultati TV',
    path: '/acr?type=TV',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Download',
    path: '/risultatinull',
    icon: icon('ic_blog'),
  },
];

export default navConfig;
