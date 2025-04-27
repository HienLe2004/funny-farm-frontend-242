import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button'; 
import { Moon, Sun } from 'lucide-react'; 
import { cn } from '@/lib/utils';

const useTheme = () => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme) {
        setTheme(savedTheme as 'light' | 'dark');
      } else if (systemDark) {
        setTheme('dark');
      }
    }
  }, [setTheme]);

  return { theme, setTheme };
};

const DarkModeButton = ({collapsed}:{collapsed:boolean}) => {
  const { setTheme, theme } = useTheme();

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      onClick={toggleDarkMode}
      className={cn("w-full ",
                    collapsed ? "justify-center px-2" : "justify-start")}
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 rotate-0 transition-all dark:-rotate-90" />
      ) : (
        <Moon className="h-4 w-4 rotate-90 transition-all dark:rotate-0 " />
      )}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};

export default DarkModeButton;
