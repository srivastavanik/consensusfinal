import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
    darkMode: ["class"],
    content: ["./src/**/*.tsx"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-roboto)',
                    ...fontFamily.sans
                ]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
			  // Google-esque pink and white theme
			  background: '#ffffff',
			  foreground: '#202124',
			  card: {
				DEFAULT: '#ffffff',
				foreground: '#202124'
			  },
			  popover: {
				DEFAULT: '#ffffff',
				foreground: '#202124'
			  },
			  primary: {
				DEFAULT: '#ea4c89', // Pink
				foreground: '#ffffff'
			  },
			  secondary: {
				DEFAULT: '#fce7f3', // Light Pink
				foreground: '#831843'
			  },
			  muted: {
				DEFAULT: '#f5f5f5',
				foreground: '#737373'
			  },
			  accent: {
				DEFAULT: '#db2777', // Darker Pink
				foreground: '#ffffff'
			  },
			  destructive: {
				DEFAULT: '#ef4444',
				foreground: '#ffffff'
			  },
			  border: '#e5e7eb',
			  input: '#e5e7eb',
			  bgcol: {
  				DEFAULT: '#ffffff',
  				light: '#f5f5f5',
  				lighter: '#ffffff',
  			},
  		}
  	},
  },
  plugins: []
} satisfies Config;
