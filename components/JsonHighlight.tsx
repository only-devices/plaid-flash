import { useMemo, useRef, useState } from 'react';

interface JsonHighlightProps {
  data: any;
  highlightKeys?: string[];
  onCopy?: () => void;
  showCopyButton?: boolean;
}

// Generate unique ID for each component instance
let instanceCounter = 0;

export default function JsonHighlight({ data, highlightKeys = [], onCopy, showCopyButton = true }: JsonHighlightProps) {
  const [showCopied, setShowCopied] = useState(false);
  const instanceId = useMemo(() => `json-${++instanceCounter}`, []);
  const keyCounter = useRef(0);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setShowCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const formatJson = (obj: any, indent = 0, parentKey?: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const spaces = '  '.repeat(indent);

    if (obj === null) {
      elements.push(
        <span key={`${instanceId}-${keyCounter.current++}`} className="json-null">null</span>
      );
      return elements;
    }

    if (typeof obj === 'boolean') {
      elements.push(
        <span key={`${instanceId}-${keyCounter.current++}`} className="json-boolean">{obj.toString()}</span>
      );
      return elements;
    }

    if (typeof obj === 'number') {
      elements.push(
        <span key={`${instanceId}-${keyCounter.current++}`} className="json-number">{obj}</span>
      );
      return elements;
    }

    if (typeof obj === 'string') {
      elements.push(
        <span key={`${instanceId}-${keyCounter.current++}`} className="json-string">&quot;{obj}&quot;</span>
      );
      return elements;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        elements.push(
          <span key={`${instanceId}-${keyCounter.current++}`} className="json-punctuation">[]</span>
        );
        return elements;
      }

      elements.push(
        <span key={`${instanceId}-${keyCounter.current++}`} className="json-punctuation">[</span>,
        <br key={`${instanceId}-${keyCounter.current++}`} />
      );

      obj.forEach((item, index) => {
        elements.push(
          <span key={`${instanceId}-${keyCounter.current++}`}>{spaces}  </span>
        );
        elements.push(...formatJson(item, indent + 1));
        if (index < obj.length - 1) {
          elements.push(
            <span key={`${instanceId}-${keyCounter.current++}`} className="json-punctuation">,</span>
          );
        }
        elements.push(<br key={`${instanceId}-${keyCounter.current++}`} />);
      });

      elements.push(
        <span key={`${instanceId}-${keyCounter.current++}`}>{spaces}</span>,
        <span key={`${instanceId}-${keyCounter.current++}`} className="json-punctuation">]</span>
      );
      return elements;
    }

    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        elements.push(
          <span key={`${instanceId}-${keyCounter.current++}`} className="json-punctuation">{'{}'}</span>
        );
        return elements;
      }

      elements.push(
        <span key={`${instanceId}-${keyCounter.current++}`} className="json-punctuation">{'{'}</span>,
        <br key={`${instanceId}-${keyCounter.current++}`} />
      );

      keys.forEach((key, index) => {
        const shouldHighlight = highlightKeys.includes(key);
        const lineElements: JSX.Element[] = [];
        
        lineElements.push(
          <span key={`${instanceId}-${keyCounter.current++}`}>{spaces}  </span>,
          <span key={`${instanceId}-${keyCounter.current++}`} className="json-key">&quot;{key}&quot;</span>,
          <span key={`${instanceId}-${keyCounter.current++}`} className="json-punctuation">: </span>
        );
        lineElements.push(...formatJson(obj[key], indent + 1, key));
        if (index < keys.length - 1) {
          lineElements.push(
            <span key={`${instanceId}-${keyCounter.current++}`} className="json-punctuation">,</span>
          );
        }
        
        if (shouldHighlight) {
          elements.push(
            <span key={`${instanceId}-${keyCounter.current++}`} className="json-highlight">
              {lineElements}
            </span>
          );
        } else {
          elements.push(...lineElements);
        }
        
        elements.push(<br key={`${instanceId}-${keyCounter.current++}`} />);
      });

      elements.push(
        <span key={`${instanceId}-${keyCounter.current++}`}>{spaces}</span>,
        <span key={`${instanceId}-${keyCounter.current++}`} className="json-punctuation">{'}'}</span>
      );
      return elements;
    }

    return elements;
  };

  keyCounter.current = 0;

  return (
    <div className="json-container">
      {showCopyButton && (
        <button 
          className={`json-copy-button ${showCopied ? 'copied' : ''}`}
          onClick={handleCopy}
          aria-label="Copy to clipboard"
        >
          {showCopied ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      )}
      <pre className="code-block">
        <code>{formatJson(data)}</code>
      </pre>
    </div>
  );
}
