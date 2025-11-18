import { useMemo, useRef } from 'react';

interface JsonHighlightProps {
  data: any;
  highlightKeys?: string[];
}

// Generate unique ID for each component instance
let instanceCounter = 0;

export default function JsonHighlight({ data, highlightKeys = [] }: JsonHighlightProps) {
  // Generate a unique ID for this component instance
  const instanceId = useMemo(() => `json-${++instanceCounter}`, []);
  
  // Use a counter to ensure every element gets a unique key
  const keyCounter = useRef(0);
  
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

  // Reset counter before each render
  keyCounter.current = 0;

  return (
    <pre className="code-block">
      <code>{formatJson(data)}</code>
    </pre>
  );
}



