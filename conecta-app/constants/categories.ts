import { MaterialIcons } from '@expo/vector-icons';

export type Category = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

export const CATEGORIES: Category[] = [
  { key: 'Limpeza',      label: 'Limpeza',      icon: 'cleaning-services',   color: '#dae1ff' },
  { key: 'Elétrica',     label: 'Elétrica',     icon: 'electrical-services', color: '#e1d8fa' },
  { key: 'Encanamento',  label: 'Encanamento',  icon: 'plumbing',            color: '#c8f0e8' },
  { key: 'Pintura',      label: 'Pintura',      icon: 'format-paint',        color: '#fde8c8' },
  { key: 'Reformas',     label: 'Reformas',     icon: 'construction',        color: '#fde0d0' },
  { key: 'Jardinagem',   label: 'Jardinagem',   icon: 'yard',                color: '#d0f0d8' },
  { key: 'Climatização', label: 'Climatização', icon: 'ac-unit',             color: '#c8e8fd' },
  { key: 'Mais',         label: 'Mais',         icon: 'apps',                color: '#e4e2e6' },
];
