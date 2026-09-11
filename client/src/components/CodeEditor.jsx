import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

const BOILERPLATE = {
  c: `#include <stdio.h>

int main() {
    // Your code here
    
    return 0;
}`,
  python: `# Your code here

`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
        
    }
}`,
};

const CodeEditor = ({ value, onChange, language = 'python', readOnly = false, height = '400px' }) => {
  const { theme } = useTheme();
  const textareaRef = useRef(null);
  const lineNumberRef = useRef(null);
  const [lineCount, setLineCount] = useState(1);

  // Sync line count
  useEffect(() => {
    const lines = (value || '').split('\n').length;
    setLineCount(Math.max(lines, 1));
  }, [value]);

  // Sync scroll between line numbers and textarea
  const handleScroll = useCallback(() => {
    if (lineNumberRef.current && textareaRef.current) {
      lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Handle Tab key: insert 4 spaces instead of changing focus
  const handleKeyDown = (e) => {
    if (readOnly) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    ';

      const newValue = value.substring(0, start) + spaces + value.substring(end);
      onChange(newValue);

      // Restore cursor position
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      });
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const currentLine = value.substring(0, start).split('\n').pop();
      const indent = currentLine.match(/^\s*/)[0];

      const newValue = value.substring(0, start) + '\n' + indent + value.substring(textarea.selectionEnd);
      onChange(newValue);

      requestAnimationFrame(() => {
        const newPos = start + 1 + indent.length;
        textarea.selectionStart = textarea.selectionEnd = newPos;
      });
    }
  };

  const isDark = theme !== 'light';
  const bgColor = isDark ? '#0d1117' : '#fafbfc';
  const textColor = isDark ? '#e6edf3' : '#1f2328';
  const lineNumColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)';
  const lineNumBg = isDark ? '#0a0e14' : '#f0f2f5';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#d0d7de';
  const caretColor = isDark ? '#58a6ff' : '#0969da';

  return (
    <div
      style={{
        display: 'flex',
        borderRadius: '10px',
        border: `1px solid ${borderColor}`,
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
        fontSize: '13px',
        lineHeight: '1.6',
        height,
        position: 'relative',
      }}
    >
      {/* Line numbers */}
      <div
        ref={lineNumberRef}
        style={{
          width: '48px',
          minWidth: '48px',
          background: lineNumBg,
          color: lineNumColor,
          padding: '12px 0',
          textAlign: 'right',
          userSelect: 'none',
          overflow: 'hidden',
          borderRight: `1px solid ${borderColor}`,
          fontSize: '13px',
          lineHeight: '1.6',
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} style={{ paddingRight: '10px', height: '20.8px' }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder={BOILERPLATE[language] || '// Write your code here...'}
        style={{
          flex: 1,
          background: bgColor,
          color: textColor,
          border: 'none',
          outline: 'none',
          padding: '12px 16px',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          resize: 'none',
          whiteSpace: 'pre',
          overflowWrap: 'normal',
          overflowX: 'auto',
          overflowY: 'auto',
          tabSize: 4,
          caretColor,
          cursor: readOnly ? 'default' : 'text',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};

CodeEditor.BOILERPLATE = BOILERPLATE;

export default CodeEditor;
