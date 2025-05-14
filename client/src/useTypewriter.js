import { useEffect, useState } from 'react';

export default function useTypewriter(text, speed = 20) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }

    let i = 0;
    setDisplayedText(''); // Reset on new text

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text[i]);
      i++;

      if (i >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    // Clear previous interval when text changes
    return () => clearInterval(interval);
  }, [text, speed]);

  return displayedText;
}
