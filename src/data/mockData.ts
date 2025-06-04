import { Category, Project } from '../types';
import { 
  ShoppingCart, 
  Home, 
  Pizza, 
  Car, 
  Briefcase, 
  Wifi, 
  Smartphone, 
  HeartPulse, 
  GraduationCap, 
  Plane,
  Building2,
  Construction
} from 'lucide-react';

export const defaultCategories: Category[] = [
  {
    id: 'office',
    name: 'Office Expenses',
    icon: 'Building2',
    subcategories: [
      { id: 'rent', name: 'Rent', icon: 'Home' },
      { id: 'utilities', name: 'Electricity & Utilities', icon: 'Wifi' },
      { id: 'supplies', name: 'Office Supplies', icon: 'ShoppingCart' },
      { id: 'furniture', name: 'Furniture & Equipment', icon: 'Briefcase' },
      { id: 'salaries', name: 'Salaries & Wages', icon: 'Briefcase' },
      { id: 'maintenance', name: 'Maintenance & Repairs', icon: 'Construction' },
      { id: 'cleaning', name: 'Cleaning Services', icon: 'Home' },
      { id: 'telecom', name: 'Telephone & Internet', icon: 'Smartphone' },
      { id: 'software', name: 'Software & Subscriptions', icon: 'Wifi' },
      { id: 'travel', name: 'Travel & Conveyance', icon: 'Plane' },
      { id: 'courier', name: 'Courier & Postage', icon: 'Car' },
      { id: 'refreshments', name: 'Refreshments', icon: 'Pizza' },
      { id: 'marketing', name: 'Marketing & Advertising', icon: 'Briefcase' },
      { id: 'consultant', name: 'Consultant Fees', icon: 'Briefcase' },
      { id: 'misc', name: 'Miscellaneous', icon: 'ShoppingCart' }
    ]
  },
  {
    id: 'construction',
    name: 'Site & Construction',
    icon: 'Construction',
    subcategories: [
      { id: 'land', name: 'Land Purchase', icon: 'Home' },
      { id: 'site-prep', name: 'Site Clearance & Preparation', icon: 'Construction' },
      { id: 'architect', name: 'Architect & Design Fees', icon: 'Briefcase' },
      { id: 'permissions', name: 'Permissions & Approvals', icon: 'Briefcase' },
      { id: 'materials', name: 'Material Purchase', icon: 'ShoppingCart' },
      { id: 'labor', name: 'Labor Charges', icon: 'Briefcase' },
      { id: 'machinery', name: 'Site Machinery Rental', icon: 'Construction' },
      { id: 'transport', name: 'Transportation', icon: 'Car' },
      { id: 'foundation', name: 'Foundation Work', icon: 'Construction' },
      { id: 'superstructure', name: 'Superstructure Costs', icon: 'Construction' },
      { id: 'roofing', name: 'Roofing & Waterproofing', icon: 'Home' },
      { id: 'plumbing', name: 'Plumbing & Sanitary', icon: 'Construction' },
      { id: 'electrical', name: 'Electrical Work', icon: 'Wifi' },
      { id: 'interior', name: 'Interior Finishing', icon: 'Home' },
      { id: 'painting', name: 'Painting & Polishing', icon: 'Construction' },
      { id: 'boundary', name: 'Boundary Wall & Gate', icon: 'Construction' },
      { id: 'supervision', name: 'Site Supervision & Staff', icon: 'Briefcase' },
      { id: 'amenities', name: 'Amenities Construction', icon: 'Construction' },
      { id: 'contingency', name: 'Contingency', icon: 'ShoppingCart' }
    ]
  }
];

export const defaultProjects: Project[] = [
  { id: '1', name: 'Personal', color: '#3B82F6' },
  { id: '2', name: 'Work', color: '#10B981' },
  { id: '3', name: 'Home Renovation', color: '#F59E0B' },
];

export const categoryIcons: Record<string, React.ElementType> = {
  ShoppingCart,
  Home,
  Pizza,
  Car,
  Briefcase,
  Wifi,
  Smartphone,
  HeartPulse,
  GraduationCap,
  Plane,
  Building2,
  Construction
};